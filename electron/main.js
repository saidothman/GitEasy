import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import http from 'http';

const execPromise = util.promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;

const storePath = () => path.join(app.getPath('userData'), 'giteasy-config.json');

function getStoredToken() {
  try {
    const file = storePath();
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      return data.token || null;
    }
  } catch (err) {
    console.error('Error reading stored token:', err);
  }
  return null;
}

function saveStoredToken(token) {
  try {
    const file = storePath();
    const data = { token };
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving stored token:', err);
  }
}

function clearStoredToken() {
  try {
    const file = storePath();
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  } catch (err) {
    console.error('Error clearing stored token:', err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    title: 'GitEasy',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  const distPath = path.join(__dirname, '../dist/index.html');

  if (!isDev && fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  } else {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      if (fs.existsSync(distPath)) {
        mainWindow.loadFile(distPath);
      }
    });
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers

// Feature A: Check if git is installed
ipcMain.handle('git:check-installed', async () => {
  try {
    const { stdout } = await execPromise('git --version');
    return { installed: true, version: stdout.trim() };
  } catch (error) {
    return { installed: false, error: error.message };
  }
});

// Select folder dialog
ipcMain.handle('dialog:select-folder', async () => {
  try {
    const win = BrowserWindow.getFocusedWindow() || mainWindow;
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
      title: 'Select Project Directory to Upload',
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  } catch (err) {
    console.error('Error opening folder dialog:', err);
    return null;
  }
});

// Token Storage IPC
ipcMain.handle('auth:get-token', () => getStoredToken());
ipcMain.handle('auth:save-token', (_event, token) => {
  saveStoredToken(token);
  return true;
});
ipcMain.handle('auth:clear-token', () => {
  clearStoredToken();
  return true;
});

// Shell link handler
ipcMain.handle('shell:open-external', (_event, url) => {
  shell.openExternal(url);
});

// OAuth Loopback Server Flow
ipcMain.handle('auth:start-oauth', async () => {
  return new Promise((resolve, reject) => {
    // Standard GitEasy Public Client ID for GitHub OAuth or local server receiver
    // If client ID is set, use GitHub OAuth flow.
    const CLIENT_ID = 'Ov23liO8v5wV233g8V2V'; // Placeholder / fallback
    const PORT = 45678;
    const REDIRECT_URI = `http://localhost:${PORT}/callback`;

    const server = http.createServer(async (req, res) => {
      try {
        const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
        if (reqUrl.pathname === '/callback') {
          const code = reqUrl.searchParams.get('code');
          const tokenParam = reqUrl.searchParams.get('token');

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                  .card { text-align: center; background: #1e293b; padding: 2rem 3rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                  h1 { color: #38bdf8; margin-bottom: 0.5rem; }
                  p { color: #94a3b8; }
                </style>
              </head>
              <body>
                <div class="card">
                  <h1>GitEasy Authenticated!</h1>
                  <p>You can close this window and return to GitEasy app.</p>
                </div>
              </body>
            </html>
          `);

          server.close();

          if (tokenParam) {
            saveStoredToken(tokenParam);
            resolve({ success: true, token: tokenParam });
          } else if (code) {
            resolve({ success: true, code });
          } else {
            resolve({ success: false, error: 'No authorization code received' });
          }
        }
      } catch (err) {
        server.close();
        reject(err);
      }
    });

    server.listen(PORT, () => {
      // Prompt OAuth URL in browser
      const oauthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=repo%20user`;
      shell.openExternal(oauthUrl);
    });

    server.on('error', (err) => {
      reject(err);
    });

    // Timeout after 3 minutes
    setTimeout(() => {
      server.close();
      resolve({ success: false, error: 'Authentication timed out' });
    }, 180000);
  });
});

// Feature D & E: Automated Git Pipeline Execution with step tracking
ipcMain.handle('git:execute-pipeline', async (event, { folderPath, repoUrl, repoOwner, repoName, token }) => {
  const steps = [
    { title: 'Initializing Git Repository', cmd: 'git init' },
    { title: 'Staging files for commit', cmd: 'git add .' },
    { title: 'Creating initial commit', cmd: 'git commit -m "Initial commit via GitEasy Desktop App"' },
    { title: 'Setting default branch to main', cmd: 'git branch -M main' },
    { title: 'Connecting to GitHub repository', cmd: 'remote_setup' },
    { title: 'Uploading files to GitHub', cmd: 'push' },
  ];

  // Helper to send progress to UI
  const sendProgress = (stepIndex, status, log = '', error = null) => {
    event.sender.send('git:progress', {
      stepIndex,
      status, // 'pending' | 'in-progress' | 'success' | 'error'
      log,
      error,
    });
  };

  // Validate directory before proceeding
  if (!folderPath || !fs.existsSync(folderPath)) {
    const dirErr = `Folder directory does not exist or is invalid: "${folderPath || ''}". Please select a valid local folder path.`;
    sendProgress(0, 'error', dirErr, dirErr);
    return { success: false, failedStep: 0, error: dirErr };
  }

  // Pre-check if git CLI is accessible
  try {
    await execPromise('git --version');
  } catch (gitCheckErr) {
    const gitErr = 'Git is not installed or not available in your system PATH. Please install Git from https://git-scm.com/ and restart the application.';
    sendProgress(0, 'error', gitErr, gitErr);
    return { success: false, failedStep: 0, error: gitErr };
  }

  const authenticatedRemoteUrl = `https://${token}@github.com/${repoOwner}/${repoName}.git`;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    sendProgress(i, 'in-progress', `Running: ${step.title}...`);

    try {
      if (step.cmd === 'remote_setup') {
        // Check if origin exists
        try {
          await execPromise('git remote get-url origin', { cwd: folderPath });
          // Set new url
          await execPromise(`git remote set-url origin ${authenticatedRemoteUrl}`, { cwd: folderPath });
        } catch {
          // Add origin
          await execPromise(`git remote add origin ${authenticatedRemoteUrl}`, { cwd: folderPath });
        }
      } else if (step.cmd === 'push') {
        await execPromise('git push -u origin main', { cwd: folderPath });
      } else if (step.cmd.startsWith('git commit')) {
        try {
          await execPromise(step.cmd, { cwd: folderPath });
        } catch (commitErr) {
          // Handle case where nothing to commit (already committed)
          if (commitErr.stdout?.includes('nothing to commit') || commitErr.stderr?.includes('nothing to commit')) {
            sendProgress(i, 'success', 'No new changes to commit (already up to date).');
            continue;
          }
          throw commitErr;
        }
      } else {
        await execPromise(step.cmd, { cwd: folderPath });
      }

      sendProgress(i, 'success', `Completed: ${step.title}`);
    } catch (err) {
      const rawError = (err.stderr && err.stderr.trim()) || (err.stdout && err.stdout.trim()) || err.message || String(err);
      sendProgress(i, 'error', rawError, rawError);
      return { success: false, failedStep: i, error: rawError };
    }
  }

  return { success: true };
});
