@echo off
echo Starting AI Assistant Service...
echo ================================

echo.
echo Checking if Node.js is installed...
node --version
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Starting AI service on http://localhost:3000
echo Press Ctrl+C to stop the service
echo.

node ai-service.js

pause


