@echo off
echo AI Assistant Chrome Extension - Installation Script
echo ================================================

echo.
echo Step 1: Installing Node.js dependencies...
npm install

if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Creating extension icons...
echo Please open create-icons.html in your browser and download the required icons
echo Place them in the icons/ folder with names: icon16.png, icon32.png, icon48.png, icon128.png
echo.
echo Step 3: Starting AI service...
echo The AI service will start on http://localhost:3000
echo Press Ctrl+C to stop the service when needed
echo.

npm start

pause

