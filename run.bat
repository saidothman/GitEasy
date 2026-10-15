@echo off
cd /d "%~dp0"
echo Starting GitEasy...
if not exist "dist\index.html" (
    echo Building frontend...
    npm run build
)
npm run electron
