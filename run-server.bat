@echo off
rem Copyright (c) 2026:
rem vatofichor - Sebastian Mass     [>_<]
rem & Assisted By Gemini Antigravity /|\
rem Licensed under the MIT License. See LICENSE in the project root.

echo ========================================================
echo md2web Reader - Local Development Server
echo ========================================================
echo.
echo Checking environment dependencies...

where php >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PHP CLI is not installed or not added to your system PATH.
    echo.
    echo Please install PHP (version 7.4+ recommended) and add it to your
    echo system Environment Variables (PATH) to use this server.
    echo.
    pause
    exit /b 1
)

echo [OK] PHP CLI detected.
echo.
echo Starting local web server on: http://localhost:8080
echo.
echo Press Ctrl+C in this window to stop the server.
echo.
php -S localhost:8080 index.php
