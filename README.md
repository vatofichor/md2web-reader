# md2web Standalone Reader

A lightweight, responsive standalone document viewer for Markdown and Plain Text files, compiled with the md2web compiler engine. Designed with retro-modern aesthetics, featuring Slate Dark and Cream Light themes.

[In the style of simple-course-explorer](https://github.com/vatofichor/simple-course-explorer)

---

## Features

- **Subdirectory Safe**: Absolute portability across virtual hosts, subdomains, and subdirectory layouts (`http://example.com/md2web-reader/`).
- **Secure File Access**: Traversal-defense APIs restricting reads exclusively to authorized `.md` and `.txt` files under the private `/content` directory.
- **Retro-Modern Design**: High-density Windows Classic / retro aesthetics with smooth fluid layouts, theme toggling, and draggable sidebar resizer.
- **Offline Compatibility**: Easily open local files directly via client-side `FileReader` API.

---

## Installation & Server Launch

### 1. Requirements
- PHP 7.4 or higher installed.

### 2. Launch Local Server (Windows)
Double-click the `run-server.bat` file in the root folder.
This script checks your local PATH environment variable for PHP, and automatically fires up a local web server at:
[http://localhost:8080](http://localhost:8080)

### 3. Launch Local Server (Manual / Unix / macOS)
Open a terminal in the project root directory and execute:
```bash
php -S localhost:8080 index.php
```

### 4. Deploying to Apache / LAMP Subdirectories
Simply upload the project folder to your server. The relative configurations in the root and public `.htaccess` files automatically map request URIs and assets securely without needing manual config edits.

---

## Configuration & Usage

- **Adding Documents**: Drop your `.md` and `.txt` files inside the private `/content` directory. They will be auto-scanned and populated in the explorer tree.
- **Viewing Locally**: Drag/drop files or use the **"Load Local"** command inside the viewer to load off-disk files.

---

# Copyright (c) 2026:
# vatofichor - Sebastian Mass     [>_<]
# & Assisted By Gemini Antigravity /|\
