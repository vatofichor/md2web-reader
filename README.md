# md2web Standalone Reader

A lightweight, responsive standalone document viewer for Markdown and Plain Text files, compiled with the md2web compiler engine. Designed with retro-modern aesthetics, featuring Slate Dark and Cream Light themes.

---

## Features

- **Subdirectory Safe**: Absolute portability across virtual hosts, subdomains, and subdirectory layouts (`http://example.com/md2web-reader/`).
- **Secure File Access**: Traversal-defense APIs restricting reads exclusively to authorized `.md` and `.txt` files under the private `/content` directory.
- **Retro-Modern Design**: High-density Windows Classic / retro aesthetics with smooth fluid layouts, theme toggling, and draggable sidebar resizer.
- **Offline Compatibility**: Easily open local files directly via client-side `FileReader` API.

---

## Installation, Server Launch & Utilities

### 1. Requirements
- PHP 7.4 or higher installed (or run `install.bat` on Windows to unpack bundled PHP 8.5 runtime).

### 2. Environment Installation & Deployment
- **Windows**: Run `install.bat` in the project root to extract bundled PHP to `lib/php/` and deploy launcher scripts.
- **Linux / macOS**: Run `./install.sh` to verify system PHP CLI dependencies and deploy launcher scripts.

### 3. Launching Local Web Server
- **Windows**: Double-click `run-server.bat`, `md2web.bat`, or `md2reader.bat` in the root folder.
- **Linux / macOS**: Execute `./run-server.sh`, `./md2web`, or `./md2reader`.
- **Manual Launch**: Run `php -S localhost:8080 index.php` in project root.

Server will be accessible at: [http://localhost:8080](http://localhost:8080)

### 4. Windows PATH Registration Utility
To launch the reader from any terminal window using `md2web` or `md2reader`:
- Execute `dev\admin_scripts\add_to_path.bat`. This registers the project root in your Windows User `PATH` (no Admin/UAC elevation required).

### 5. Uninstallation & Cleanup
- **Windows**: Run `uninstall.bat` to clean up root runner scripts and delete extracted `lib\php\` while preserving `lib\php.zip`.
- **Linux / macOS**: Run `./uninstall.sh` to remove root launcher scripts.

---

## Configuration & Document Preloading

- **Preloading Documents**: Drop any `.md` or `.txt` files directly into the private `/content/` directory (or via the `/public/content` or `/dev/content` directory symlinks).
- **Subdirectory Placement & Collapsible Tree**: Organize documentation using nested subdirectories inside `/content/` (e.g., `/content/01_Basics/getting_started.md`, `/content/02_Advanced/api_reference.md`). The reader recursively scans all nested folders (`scan_directory_recursive`) and automatically constructs a collapsible folder tree in the GUI explorer sidebar.
- **Viewing Locally**: Drag/drop files or use the **"Load Local"** command inside the viewer to load off-disk files.

---

# Copyright (c) 2026:
# vatofichor - Sebastian Mass     [>_<]
# & Assisted By Gemini Antigravity /|\
