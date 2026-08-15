#!/usr/bin/env bash
# Copyright (c) 2026:
# vatofichor - Sebastian Mass     [>_<]
# & Assisted By Gemini Antigravity /|\
# Licensed under the MIT License. See LICENSE in the project root.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================================"
echo "md2web Reader - Linux/Unix Uninstaller"
echo "========================================================"
echo ""

echo "[1/2] Removing Linux root server runners and launcher aliases..."

if [ -f "$SCRIPT_DIR/linux_run-server.sh" ]; then
    rm -f "$SCRIPT_DIR/linux_run-server.sh"
    echo " - Removed: linux_run-server.sh"
fi
if [ -f "$SCRIPT_DIR/md2web" ]; then
    rm -f "$SCRIPT_DIR/md2web"
    echo " - Removed: md2web"
fi
if [ -f "$SCRIPT_DIR/md2reader" ]; then
    rm -f "$SCRIPT_DIR/md2reader"
    echo " - Removed: md2reader"
fi

echo "[OK] Root runners and launcher aliases removed."

echo "[2/2] Verification complete."

echo ""
echo "========================================================"
echo "Uninstallation complete! All deployed Linux runners cleaned."
echo "========================================================"
echo ""
read -p "Press Enter to close uninstaller..." _dummy_var
