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
if ($null -eq $UserPath) {
    $UserPath = ""
}

$PathEntries = $UserPath -split ';' | Where-Object { $_ -ne "" } | ForEach-Object { $_.TrimEnd('\') }

# Check for duplicates
if ($PathEntries -contains $CanonicalTarget) {
    Write-Host "[INFO] Project root is already registered in Windows User PATH." -ForegroundColor Yellow
} else {
    Write-Host "[ACTION] Adding project root to Windows User PATH..." -ForegroundColor Green
    if ([string]::IsNullOrWhiteSpace($UserPath)) {
        $NewPath = $CanonicalTarget
    } else {
        $NewPath = $UserPath.TrimEnd(';') + ";" + $CanonicalTarget
    }
    
    try {
        [Environment]::SetEnvironmentVariable("PATH", $NewPath, "User")
        Write-Host "[OK] Successfully added '$CanonicalTarget' to Windows User PATH." -ForegroundColor Green
        Write-Host "[NOTE] Restart open CMD/PowerShell windows for PATH changes to take effect." -ForegroundColor Cyan
    } catch {
        Write-Host "[ERROR] Failed to set User PATH environment variable: $_" -ForegroundColor Red
        exit 1
    }
}
