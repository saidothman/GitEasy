import React, { useState, useEffect, useRef } from 'react';
import { Octokit } from '@octokit/rest';
import confetti from 'canvas-confetti';
import { Folder, FolderOpen, ArrowRight, ExternalLink, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

import Header from './components/Header';
import GitCheckModal from './components/GitCheckModal';
import AuthView from './components/AuthView';
import RepoSelector from './components/RepoSelector';
import ProgressTracker from './components/ProgressTracker';

export default function App() {
  const [gitInstalled, setGitInstalled] = useState(true);
  const [checkingGit, setCheckingGit] = useState(true);

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Workflow states
  const [folderPath, setFolderPath] = useState('');
  const [selectedRepo, setSelectedRepo] = useState(null);
  const fileInputRef = useRef(null);

  // Execution state: 'idle' | 'uploading' | 'success' | 'error'
  const [executionState, setExecutionState] = useState('idle');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [rawError, setRawError] = useState(null);

  const pipelineSteps = [
    { title: 'Initializing Git Repository' },
    { title: 'Staging project files' },
    { title: 'Creating initial commit' },
    { title: 'Setting main branch' },
    { title: 'Connecting to GitHub repository' },
    { title: 'Uploading code to GitHub' },
  ];

  // 1. Initial Git & Token Check
  const checkEnvironment = async () => {
    setCheckingGit(true);
    try {
      const gitRes = await window.electronAPI?.checkGit();
      setGitInstalled(gitRes?.installed ?? true);
    } catch (err) {
      console.error('Git check error:', err);
    } finally {
      setCheckingGit(false);
    }

    try {
      const savedToken = await window.electronAPI?.getToken();
      if (savedToken) {
        setToken(savedToken);
      }
    } catch (err) {
      console.error('Token fetch error:', err);
    }
  };

  useEffect(() => {
    checkEnvironment();
  }, []);

  // 2. Fetch User Profile when token changes
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    const fetchUserProfile = async () => {
      setLoadingUser(true);
      try {
        const octokit = new Octokit({ auth: token });
        const { data } = await octokit.rest.users.getAuthenticated();
        setUser(data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        await window.electronAPI?.clearToken();
        setToken(null);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  // 3. Folder Selector
  const handleSelectFolder = async () => {
    if (window.electronAPI?.selectFolder) {
      try {
        const selected = await window.electronAPI.selectFolder();
        if (selected) {
          setFolderPath(selected);
          return;
        }
      } catch (err) {
        console.error('Folder dialog error:', err);
      }
    }
    // Fallback to browser file picker if electronAPI is not present or user closed dialog
    fileInputRef.current?.click();
  };

  const handleBrowserFolderChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const firstFile = files[0];
      const fullPath = firstFile.path;
      if (fullPath) {
        const dirPath = fullPath.substring(0, Math.max(fullPath.lastIndexOf('/'), fullPath.lastIndexOf('\\')));
        setFolderPath(dirPath || fullPath);
      } else {
        const folderName = firstFile.webkitRelativePath ? firstFile.webkitRelativePath.split('/')[0] : firstFile.name;
        setFolderPath(folderName);
      }
    }
  };

  // 4. Listen for Git Progress from main process
  useEffect(() => {
    if (!window.electronAPI?.onGitProgress) return;

    const unsubscribe = window.electronAPI.onGitProgress((data) => {
      if (data.stepIndex !== undefined) {
        setActiveStepIndex(data.stepIndex);
      }
      if (data.status === 'error') {
        setRawError(data.error);
        setExecutionState('error');
      }
    });

    return () => unsubscribe();
  }, []);

  // 5. Trigger Upload Pipeline
  const handleStartUpload = async () => {
    if (!folderPath || !selectedRepo || !token) return;

    setExecutionState('uploading');
    setActiveStepIndex(0);
    setRawError(null);

    if (!window.electronAPI?.executeGitPipeline) {
      setRawError('Desktop Engine Not Connected: GitEasy must be run inside the Electron Desktop App window (npm start) to execute local Git commands.');
      setExecutionState('error');
      return;
    }

    try {
      const result = await window.electronAPI.executeGitPipeline({
        folderPath,
        repoUrl: selectedRepo.html_url,
        repoOwner: selectedRepo.owner.login,
        repoName: selectedRepo.name,
        token,
      });

      if (result?.success) {
        setExecutionState('success');
        triggerCelebration();
      } else {
        const errorMsg = result?.error || 'Execution failed: Git command encountered an error.';
        setRawError(errorMsg);
        setExecutionState('error');
      }
    } catch (err) {
      const errorMsg = err?.message || 'Execution failed: Unexpected error during upload pipeline execution.';
      setRawError(errorMsg);
      setExecutionState('error');
    }
  };

  // Confetti Celebration
  const triggerCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleSignOut = async () => {
    await window.electronAPI?.clearToken();
    setToken(null);
    setUser(null);
    setFolderPath('');
    setSelectedRepo(null);
    setExecutionState('idle');
  };

  const resetUpload = () => {
    setFolderPath('');
    setSelectedRepo(null);
    setExecutionState('idle');
    setActiveStepIndex(0);
    setRawError(null);
  };

  if (checkingGit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
        <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {!gitInstalled && <GitCheckModal onRecheck={checkEnvironment} />}

      <Header user={user} onSignOut={handleSignOut} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        {!token ? (
          <AuthView onAuthenticate={(t) => setToken(t)} />
        ) : (
          <div className="space-y-8">
            {executionState === 'success' ? (
              /* Success Celebration View */
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
                  <Sparkles className="w-10 h-10 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-extrabold text-slate-100">
                    Project Successfully Uploaded! 🎉
                  </h2>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Your local files have been pushed to GitHub. Anyone with access to your repository can now view your project.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <button
                    onClick={() => window.electronAPI?.openExternal(selectedRepo.html_url)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 text-base"
                  >
                    <span>View on GitHub</span>
                    <ExternalLink className="w-5 h-5" />
                  </button>

                  <button
                    onClick={resetUpload}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3.5 px-6 rounded-xl border border-slate-700 transition-all flex items-center justify-center space-x-2 text-base"
                  >
                    <span>Upload Another Project</span>
                  </button>
                </div>
              </div>
            ) : executionState === 'uploading' || executionState === 'error' ? (
              /* Progress Tracker View */
              <ProgressTracker
                steps={pipelineSteps}
                activeStepIndex={activeStepIndex}
                rawError={rawError}
                onRetry={handleStartUpload}
              />
            ) : (
              /* Main Wizard View */
              <div className="space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">Upload Project to GitHub</h2>
                  <p className="text-slate-400 text-sm">Select a local directory and target GitHub repository</p>
                </div>

                {/* Step 1: Select Folder Path */}
                <div className="space-y-3 pt-2">
                  <label className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                    <Folder className="w-4 h-4 text-sky-400" />
                    <span>Step 1: Select Local Project Folder Path</span>
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    webkitdirectory="true"
                    directory="true"
                    onChange={handleBrowserFolderChange}
                    className="hidden"
                  />

                  <div className="flex gap-3">
                    <div className="flex-1 relative flex items-center">
                      <FolderOpen className="w-4 h-4 text-sky-400 absolute left-3.5 flex-shrink-0 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Enter local folder path (e.g. C:\Users\name\Projects\my-project)"
                        value={folderPath}
                        onChange={(e) => setFolderPath(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSelectFolder}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-5 py-3 rounded-xl border border-slate-700 transition-all text-sm whitespace-nowrap flex items-center space-x-2"
                    >
                      <FolderOpen className="w-4 h-4 text-slate-400" />
                      <span>Browse...</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    GitEasy will execute the Git commands (<code className="text-sky-300">git init</code>, <code className="text-sky-300">add</code>, <code className="text-sky-300">commit</code>, <code className="text-sky-300">push</code>) directly inside this local folder directory.
                  </p>
                </div>

                {/* Step 2: Select Repository */}
                <div className="pt-4 border-t border-slate-800">
                  <RepoSelector
                    token={token}
                    selectedRepo={selectedRepo}
                    onSelectRepo={setSelectedRepo}
                  />
                </div>

                {/* Step 3: Execution Button */}
                <div className="pt-6 border-t border-slate-800">
                  <button
                    onClick={handleStartUpload}
                    disabled={!folderPath || !selectedRepo}
                    className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-sky-500/20 transition-all flex items-center justify-center space-x-3 text-lg"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Upload to GitHub</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
