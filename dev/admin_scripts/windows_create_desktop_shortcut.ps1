# Copyright (c) 2026:
# vatofichor - Sebastian Mass     [>_<]
# & Assisted By Gemini Antigravity /|\
# Licensed under the MIT License. See LICENSE in the project root.

param (
    [string]$TargetDir = ""
)

if ([string]::IsNullOrWhiteSpace($TargetDir)) {
    # Default to project root (parent directory of dev/admin_scripts)
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $TargetDir = Resolve-Path (Join-Path $ScriptDir "..\..") | Select-Object -ExpandProperty Path
}

if (-not (Test-Path $TargetDir)) {
    Write-Host "[ERROR] Target directory does not exist: $TargetDir" -ForegroundColor Red
    exit 1
}

$CanonicalTargetDir = (Get-Item -Path $TargetDir).FullName.TrimEnd('\')
$RunnerBatch = Join-Path $CanonicalTargetDir "windows_run-server.bat"

if (-not (Test-Path $RunnerBatch)) {
    Write-Host "[ERROR] Runner batch script not found at: $RunnerBatch" -ForegroundColor Red
    exit 1
}

# Resolve Desktop Folder Path
$DesktopPath = [Environment]::GetFolderPath("Desktop")
if (-not (Test-Path $DesktopPath)) {
    Write-Host "[ERROR] Windows Desktop folder path could not be resolved." -ForegroundColor Red
    exit 1
}

$ShortcutPath = Join-Path $DesktopPath "md2web Reader.lnk"

Write-Host "Target Batch File: $RunnerBatch" -ForegroundColor Cyan
Write-Host "Working Directory: $CanonicalTargetDir" -ForegroundColor Cyan
Write-Host "Desktop Shortcut:  $ShortcutPath" -ForegroundColor Cyan

try {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = $RunnerBatch
    $Shortcut.WorkingDirectory = $CanonicalTargetDir
    $Shortcut.Description = "Launch md2web Reader Standalone Web Server"
    $Shortcut.Save()
    
    Write-Host "[OK] Desktop shortcut created successfully!" -ForegroundColor Green
    Write-Host "     Shortcut location: $ShortcutPath" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to create desktop shortcut: $_" -ForegroundColor Red
    exit 1
}
