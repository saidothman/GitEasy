# GitEasy 🚀

**GitEasy** is a user-friendly desktop application designed for beginners to seamlessly upload local projects to GitHub without needing command-line Git commands. 

Built with **Electron**, **React**, **Vite**, and **Tailwind CSS**, GitEasy automates the entire Git repository setup, staging, committing, and pushing workflow through an intuitive graphical interface.

---

## ✨ Features

- 🔍 **Automated System Pre-checks**: Automatically checks if Git CLI is installed and available on your system environment PATH.
- 🔑 **Flexible Authentication**: Sign in quickly using GitHub OAuth via browser loopback or using a Personal Access Token (PAT).
- 📁 **Simple Folder Picker**: Easily select any local folder or project directory from your computer.
- 📦 **Repository Management**: Choose from existing GitHub repositories or create a new public/private repository directly inside the app.
- ⚡ **Automated 6-Step Git Pipeline**: Automates `git init`, staging (`git add`), committing (`git commit`), branch initialization (`main`), remote binding, and pushing (`git push`).
- 📊 **Real-time Progress Tracker**: Live progress updates, step indicators, error reporting, and celebratory confetti upon successful upload.

---

## 📋 Prerequisites

Before installing and using GitEasy, make sure you have the following installed on your machine:

1. **[Node.js](https://nodejs.org/)** (v18.0.0 or higher recommended)
2. **[Git](https://git-scm.com/)** installed and added to your system environment variables (PATH).
3. A **[GitHub](https://github.com/)** account.

---

## 🛠️ Installation & Setup Steps

Follow these steps to set up and run GitEasy locally:

### Step 1: Clone or Download the Repository

Clone this repository to your local machine using Git, or download and extract the ZIP archive:

```bash
git clone https://github.com/your-username/giteasy.git
cd giteasy
```

### Step 2: Install Dependencies

Install all required NPM packages:

```bash
npm install
```

### Step 3: Launch the Application

To build the frontend UI and start the desktop Electron application:

```bash
npm run start
```

*Alternatively, for development mode with hot reloading:*

```bash
# Terminal 1: Run Vite dev server
npm run dev

# Terminal 2: Run Electron
npm run electron
```

---

## 🚀 How to Use GitEasy

Using GitEasy to upload your project takes just 4 simple steps:

### Step 1: Authenticate with GitHub
- Open GitEasy.
- Click **"Sign in with GitHub"** to authenticate via your web browser, or select **"Enter Personal Access Token manually"**.
- *(If using a PAT, ensure it has `repo` and `user` permissions).*

### Step 2: Select Your Local Project Directory
- Click the **"Select Project Folder"** button.
- Choose the local folder on your computer that contains the project files you wish to upload.

### Step 3: Choose or Create a GitHub Repository
- Select an existing repository from your GitHub account dropdown list, OR
- Click **"Create New Repository"**, enter a repository name, select Visibility (**Public** or **Private**), and click **Create**.

### Step 4: Upload Your Project
- Click **"Upload Project to GitHub"**.
- GitEasy will execute the automated 6-step Git process:
  1. Initializing Git repository
  2. Staging files
  3. Creating initial commit
  4. Setting main branch
  5. Connecting remote repository
  6. Pushing code to GitHub
- Once completed, click **"View on GitHub"** to open your newly uploaded repository in your browser!

---

## 📦 Packaging for Distribution

To build standalone executable binaries (e.g., `.exe` for Windows, `.dmg` for macOS, `.AppImage` for Linux):

```bash
npx electron-builder
```

The packaged installers will be generated inside the `dist-electron/` or `dist/` directory.

---

## 📁 Project Structure

```
GitEasy/
├── electron/              # Electron main process & IPC handlers
│   ├── main.js            # Main process script & Git pipeline handler
│   └── preload.js         # Context bridge for electronAPI
├── src/                   # React frontend codebase
│   ├── components/        # React components (Auth, Progress, RepoSelector, etc.)
│   ├── App.jsx            # Main app workflow component
│   ├── main.jsx           # React entry point
│   └── index.css          # Tailwind CSS styles
├── index.html             # Vite HTML entry file
├── package.json           # Node dependencies & scripts
├── tailwind.config.js     # Tailwind configuration
└── vite.config.js         # Vite configuration
```

---

## ❓ Troubleshooting

- **"Git is not installed" Modal**: Make sure Git is installed on your computer. Download Git from [git-scm.com](https://git-scm.com/). Restart GitEasy after installation.
- **Authentication Failure**: If using a Personal Access Token, ensure it has `repo` and `user` scopes enabled on GitHub (*Settings -> Developer Settings -> Personal Access Tokens*).
- **Push Error (Non-empty Repository)**: If you select an existing repository that already contains commits, pushing might require pulling first. For best results with new uploads, select an empty repository or create a new one via GitEasy.

---

## 📄 License

[MIT License](LICENSE)
