@echo off
rem Copyright (c) 2026:
rem vatofichor - Sebastian Mass     [>_<]
rem ^& Assisted By Gemini Antigravity /^|\
rem Licensed under the MIT License. See LICENSE in the project root.

echo ========================================================
echo md2web Reader - Create Windows Desktop Server Shortcut
echo ========================================================
echo.

set "SCRIPT_DIR=%~dp0"
set "PS_SCRIPT=%SCRIPT_DIR%windows_create_desktop_shortcut.ps1"

if not exist "%PS_SCRIPT%" (
    echo [ERROR] PowerShell script not found at:
    echo         "%PS_SCRIPT%"
    echo.
    echo Press any key to exit...
    pause
    exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%"
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to create Desktop shortcut.
)

echo.
echo Press any key to close this window...
pause
