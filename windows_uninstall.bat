@echo off
rem Copyright (c) 2026:
rem vatofichor - Sebastian Mass     [>_<]
rem and Assisted By Gemini Antigravity /^|\
rem Licensed under the MIT License. See LICENSE in the project root.

echo ========================================================
echo md2web Reader - Windows Uninstaller
echo ========================================================
echo.

set "ROOT_DIR=%~dp0"
set "EXTRACT_DIR=%ROOT_DIR%lib\php"
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\md2web Reader.lnk"
set "REMOVE_PATH_PS=%ROOT_DIR%dev\admin_scripts\windows_remove_from_path.ps1"

rem 1. Desktop Shortcut Cleanup
echo [1/5] Checking for Windows Desktop shortcut...
if exist "%SHORTCUT_PATH%" (
    del /F /Q "%SHORTCUT_PATH%"
    echo [OK] Removed Desktop shortcut: md2web Reader.lnk
) else (
    echo [INFO] Desktop shortcut not found or already removed.
)
echo.

rem 2. Windows User PATH Cleanup
echo [2/5] Checking Windows User PATH environment variable...
if exist "%REMOVE_PATH_PS%" (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%REMOVE_PATH_PS%" -TargetDir "%ROOT_DIR%."
) else (
    echo [INFO] PATH removal helper script not found. Skipping PATH cleanup.
)
echo.

rem 3. Delete extracted PHP runtime folder and generated server configuration
echo [3/5] Cleaning up extracted PHP runtime directory and configuration...
if exist "%EXTRACT_DIR%" (
    rmdir /S /Q "%EXTRACT_DIR%"
    echo [OK] Removed extracted runtime directory: lib\php\
) else (
    echo [INFO] Extracted directory lib\php\ not found or already cleaned.
)
if exist "%ROOT_DIR%lib\server_config.bat" (
    del /F /Q "%ROOT_DIR%lib\server_config.bat"
    echo [OK] Removed server configuration: lib\server_config.bat
)
echo.

rem 4. Remove deployed root server runner and launcher scripts
echo [4/5] Removing root server runners and launcher aliases...
if exist "%ROOT_DIR%windows_run-server.bat" (
    del /F /Q "%ROOT_DIR%windows_run-server.bat"
    echo  - Removed: windows_run-server.bat
)
if exist "%ROOT_DIR%md2web.bat" (
    del /F /Q "%ROOT_DIR%md2web.bat"
    echo  - Removed: md2web.bat
)
if exist "%ROOT_DIR%md2reader.bat" (
    del /F /Q "%ROOT_DIR%md2reader.bat"
    echo  - Removed: md2reader.bat
)
echo [OK] Root runners and launcher aliases removed.
echo.

rem 5. Confirm preservation of lib\php.zip
echo [5/5] Preserving packaged archive lib\php.zip...
if exist "%ROOT_DIR%lib\php.zip" (
    echo [OK] Packaged archive lib\php.zip is intact for future re-installations.
) else (
    echo [WARNING] lib\php.zip archive was not found.
)

echo.
echo ========================================================
echo Uninstallation complete! All shortcuts, PATH entries,
echo runners, and extracted binaries have been cleaned up.
echo ========================================================
echo.
echo Press any key to close uninstaller...
pause
