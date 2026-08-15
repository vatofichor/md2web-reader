#!/usr/bin/env bash
# Copyright (c) 2026:
# vatofichor - Sebastian Mass     [>_<]
# & Assisted By Gemini Antigravity /|\
# Licensed under the MIT License. See LICENSE in the project root.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================================"
echo "md2web Reader - Linux/Unix Environment Installer"
echo "========================================================"
echo ""

# 1. Synchronize server runner and launcher scripts to root
echo "[1/2] Deploying Linux server runners and launcher aliases..."
if [ -f "$SCRIPT_DIR/lib/linux_run-server.sh" ]; then
    cp -f "$SCRIPT_DIR/lib/linux_run-server.sh" "$SCRIPT_DIR/linux_run-server.sh"
    chmod +x "$SCRIPT_DIR/linux_run-server.sh"
    echo " - Deployed: linux_run-server.sh"
fi

cat << 'EOF' > "$SCRIPT_DIR/md2web"
#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/linux_run-server.sh" "$@"
EOF
chmod +x "$SCRIPT_DIR/md2web"
echo " - Deployed: md2web"

cat << 'EOF' > "$SCRIPT_DIR/md2reader"
#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/linux_run-server.sh" "$@"
EOF
chmod +x "$SCRIPT_DIR/md2reader"
echo " - Deployed: md2reader"

echo "[OK] Linux runner scripts deployed."

# 2. Check for local system PHP CLI dependency
echo "[2/2] Verifying Linux system PHP dependency..."
if command -v php >/dev/null 2>&1; then
    PHP_VER=$(php -v | head -n 1)
    echo "[OK] System PHP detected: ${PHP_VER}"
    echo ""
    echo "========================================================"
    echo "Installation complete! Launch the server by running:"
    echo "  ./linux_run-server.sh OR ./md2web OR ./md2reader"
    echo "========================================================"
else
    echo ""
    echo "========================================================"
    echo "[ALERT] MISSING DEPENDENCY: PHP CLI is not installed."
    echo "========================================================"
    echo ""
    echo "Please install PHP (7.4+) via your distribution package manager:"
    echo "  - Debian/Ubuntu: sudo apt update && sudo apt install php-cli"
    echo "  - Fedora/RHEL:   sudo dnf install php-cli"
    echo "  - Arch Linux:    sudo pacman -S php"
    echo "  - macOS:         brew install php"
    echo "========================================================"
fi

echo ""
read -p "Press Enter to exit..." _dummy_var
