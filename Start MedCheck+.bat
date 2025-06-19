@echo off
echo ===================================================
echo MedCheck+ Development Starter
echo ===================================================
echo.
echo This script will start the MedCheck+ development server
echo.

rem Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed on this system.
    echo Please install Node.js from https://nodejs.org/
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

rem Run the NodeJS starter script which has better error handling
node "%~dp0start-medcheck.js"

rem If we reach here and the script exited with an error, keep the window open
if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ The development server failed to start or has stopped with an error.
    echo.
    echo Press any key to close this window...
    pause >nul
)
