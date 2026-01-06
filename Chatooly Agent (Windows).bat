@echo off
title Chatooly Agent

echo ======================================
echo    Chatooly Agent Launcher
echo ======================================
echo.

REM Get the directory where the batch file is located
cd /d "%~dp0\src"

REM Kill any process on port 3001
echo Checking for processes on port 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    echo Killing process %%a on port 3001...
    taskkill /F /PID %%a >nul 2>&1
)

REM Check if node_modules exists
if not exist "node_modules\" (
    echo.
    echo Installing dependencies (first-time setup)...
    echo This may take a few minutes...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: npm install failed. Make sure Node.js is installed.
        echo Download from: https://nodejs.org/
        echo.
        pause
        exit /b 1
    )
)

REM Check for .env file
if not exist ".env" (
    echo.
    echo WARNING: .env file not found. Some features may not work.
    echo.
)

REM Start the server
echo.
echo Starting Chatooly Agent server...
start /b npm run start

REM Wait for server to be ready (poll port 3001)
echo Waiting for server to start...
:waitloop
timeout /t 1 /nobreak >nul
netstat -an | findstr :3001 | findstr LISTENING >nul
if errorlevel 1 goto waitloop

REM Open browser (Chrome preferred, fallback to default)
echo Opening browser...
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:3001"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "http://localhost:3001"
) else (
    start "" "http://localhost:3001"
)

echo.
echo ======================================
echo    Chatooly Agent is running!
echo    Browser opened to localhost:3001
echo ======================================
echo.
echo Close this window to stop the server.
echo.

REM Keep window open to maintain server
pause >nul
