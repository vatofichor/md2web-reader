#!/usr/bin/env bash
# Copyright (c) 2026:
# vatofichor - Sebastian Mass     [>_<]
# & Assisted By Gemini Antigravity /|\
# Licensed under the MIT License. See LICENSE in the project root.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.." || cd "$SCRIPT_DIR"

echo "========================================================"
echo "md2web Reader - Local Development Server (Linux/Unix)"
echo "========================================================"
echo ""
echo "Checking environment dependencies..."

# Linux server runner ONLY looks for locally installed PHP in PATH
if command -v php >/dev/null 2>&1; then
    PHP_VERSION=$(php -v | head -n 1)
    echo "[OK] Local PHP CLI detected: ${PHP_VERSION}"
    echo ""
    echo "Starting local web server on: http://localhost:8080"
    echo "Press Ctrl+C in this terminal window to stop the server."
    echo ""
    php -S localhost:8080 index.php
    EXIT_CODE=$?
    if [ $EXIT_CODE -ne 0 ]; then
        echo ""
        echo "[ERROR] Server terminated with exit code ${EXIT_CODE}."
    fi
else
    echo ""
    echo "========================================================"
    echo "[ALERT] MISSING DEPENDENCY: PHP CLI is not installed."
    echo "========================================================"
    echo ""
    echo "Linux environments require a system-installed PHP CLI package."
    echo "Please install PHP (7.4 or higher recommended) using your package manager:"
    echo "  - Debian/Ubuntu: sudo apt update && sudo apt install php-cli"
    echo "  - Fedora/RHEL:   sudo dnf install php-cli"
    echo "  - Arch Linux:    sudo pacman -S php"
    echo "  - macOS (Homebrew): brew install php"
    echo "========================================================"
fi

echo ""
read -p "Press Enter to exit..." _dummy_var
