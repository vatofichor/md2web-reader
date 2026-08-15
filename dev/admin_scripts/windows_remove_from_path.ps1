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

$CanonicalTarget = (Get-Item -Path $TargetDir).FullName.TrimEnd('\')
Write-Host "Canonical Project Path: $CanonicalTarget" -ForegroundColor Cyan

# Fetch current User PATH environment variable
$UserPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ([string]::IsNullOrWhiteSpace($UserPath)) {
    Write-Host "[INFO] User PATH environment variable is empty. Nothing to remove." -ForegroundColor Yellow
    exit 0
}

$PathEntries = $UserPath -split ';' | Where-Object { $_ -ne "" }
$FilteredEntries = @()
$RemovedCount = 0

foreach ($entry in $PathEntries) {
    $cleanEntry = $entry.TrimEnd('\')
    if ($cleanEntry -ieq $CanonicalTarget) {
        $RemovedCount++
    } else {
        $FilteredEntries += $entry
    }
}

if ($RemovedCount -eq 0) {
    Write-Host "[INFO] Project root path was not found in User PATH environment variable." -ForegroundColor Yellow
} else {
    $NewPath = $FilteredEntries -join ';'
    try {
        [Environment]::SetEnvironmentVariable("PATH", $NewPath, "User")
        Write-Host "[OK] Successfully removed '$CanonicalTarget' from Windows User PATH." -ForegroundColor Green
        Write-Host "[NOTE] Restart open CMD/PowerShell windows for PATH changes to take effect." -ForegroundColor Cyan
    } catch {
        Write-Host "[ERROR] Failed to update User PATH environment variable: $_" -ForegroundColor Red
        exit 1
    }
}
