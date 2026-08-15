<?php
// Public UI Entry Shell
// Copyright (c) 2026:
// vatofichor - Sebastian Mass     [>_<]
// & Assisted By Gemini Antigravity /|\
// Licensed under the MIT License. See LICENSE in the project root.

if (php_sapi_name() === 'cli-server') {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if ($path !== '/' && file_exists(__DIR__ . $path) && is_file(__DIR__ . $path)) {
        return false; // let CLI server serve existing files directly
    }
}

// Extract pre-selected file route if provided
$initialRoute = isset($_GET['route']) ? $_GET['route'] : '';
// Clean up path and prevent traversal
$initialRoute = filter_var($initialRoute, FILTER_SANITIZE_URL);

// Systems dynamic base href calculation to ensure subdirectory-safety
$scriptName = str_replace('\\', '/', $_SERVER['SCRIPT_NAME']);
$requestUri = $_SERVER['REQUEST_URI'];
$scriptDir = str_replace('\\', '/', dirname($scriptName));

if (basename($scriptDir) === 'public' && strpos($requestUri, '/public/') === false) {
    $baseHref = substr($scriptDir, 0, -7); // strip '/public'
} else {
    $baseHref = $scriptDir;
}

$baseHref = rtrim($baseHref, '/') . '/';
if ($baseHref === '//') {
    $baseHref = '/';
}

// Dynamic version resolution matching root version-X-Y-Z marker file
$appVersion = 'v1.0.5';
$versionFiles = glob(dirname(__DIR__) . '/version-*');
if (!empty($versionFiles)) {
    $vFileName = basename($versionFiles[0]);
    $vClean = str_replace('version-', '', $vFileName);
    $appVersion = 'v' . str_replace('-', '.', $vClean);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base href="<?php echo htmlspecialchars($baseHref, ENT_QUOTES, 'UTF-8'); ?>">
    <title>md2web Reader - Simplex Document Viewer</title>
    <!-- Google Fonts for premium retro-modern typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Georgia:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="res/css/cleanx.css">
    <script>
        window.MD2WEB_CONFIG = {
            initialRoute: <?php echo json_encode($initialRoute); ?>
        };
    </script>
</head>
<body class="retro-workspace dark-theme">
    <div id="desktop-window" class="window-container">
        <!-- Title Bar -->
        <div class="window-titlebar">
            <div class="titlebar-info">
                <span class="titlebar-icon">📖</span>
                <span class="titlebar-title">md2web Reader - Simplex File Viewer</span>
            </div>
            <div class="titlebar-controls">
                <button class="titlebar-btn" id="btn-toggle-viewport" title="Toggle Full Viewport Size">🗖</button>
                <button class="titlebar-btn titlebar-btn-close" id="btn-close-file" title="Close Document">✕</button>
            </div>
        </div>

        <!-- Menu Bar -->
        <div class="window-menubar">
            <div class="menu-item" id="menu-file">
                <span class="menu-label">File</span>
                <div class="menu-dropdown">
                    <button class="dropdown-btn" id="btn-load-local">Open Local File...</button>
                    <div class="menu-divider"></div>
                    <button class="dropdown-btn" id="btn-exit">Exit</button>
                </div>
            </div>
            <div class="menu-item" id="menu-view">
                <span class="menu-label">View</span>
                <div class="menu-dropdown">
                    <button class="dropdown-btn" id="btn-toggle-theme">Toggle Theme (Slate/Cream)</button>
                    <button class="dropdown-btn active" id="btn-view-drawer">Show Sidebar Drawer</button>
                </div>
            </div>
            <div class="menu-item" id="menu-help">
                <span class="menu-label">Help</span>
                <div class="menu-dropdown">
                    <button class="dropdown-btn" id="btn-about">About md2web Reader...</button>
                </div>
            </div>
        </div>

        <!-- Main Window Client Area -->
        <div class="window-body">
            <!-- Sidebar Drawer (Left Panel) -->
            <aside class="sidebar-drawer" id="sidebar-drawer">
                <div class="drawer-header">
                    <span class="drawer-title">Document Explorer</span>
                    <button class="drawer-action-btn" id="btn-drawer-local-file" title="Load Local Markdown or Text file">
                        <span>📁 Load Local</span>
                    </button>
                    <input type="file" id="local-file-input" accept=".md,.txt" style="display: none;">
                </div>
                <div class="drawer-content">
                    <div class="tree-container" id="file-tree">
                        <div class="tree-loading">Scanning server content...</div>
                    </div>
                </div>
            </aside>

            <!-- Resizer Handle -->
            <div class="sidebar-resizer" id="sidebar-resizer"></div>

            <!-- Viewer Panel (Right Panel) -->
            <main class="viewer-panel">
                <div class="viewer-toolbar">
                    <div class="breadcrumb-container" id="breadcrumb">
                        <span class="crumb">Server</span>
                        <span class="crumb-separator">&gt;</span>
                        <span class="crumb active" id="current-doc-name">No file loaded</span>
                    </div>
                    <div class="toolbar-actions">
                        <span class="file-size-badge" id="file-size-badge" style="display: none;">0 B</span>
                    </div>
                </div>
                <div class="viewer-content" id="viewer-content">
                    <!-- Loaded Markdown renders here -->
                    <div class="welcome-container">
                        <div class="welcome-card">
                            <span class="welcome-logo">📖</span>
                            <h2>Welcome to md2web Reader</h2>
                            <p>Select a document from the sidebar drawer to begin reading, or load a local <code>.md</code> or <code>.txt</code> file using the <strong>Load Local</strong> command.</p>
                            <p class="small-text">Brought to you by the md2web compiler engine suite.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <!-- Status Bar -->
        <footer class="window-statusbar">
            <div class="status-cell" id="status-text">Status: Ready</div>
            <div class="status-cell" id="status-theme">Theme: Slate Dark</div>
            <div class="status-cell text-right" id="status-version"><?php echo htmlspecialchars($appVersion, ENT_QUOTES, 'UTF-8'); ?></div>
        </footer>
    </div>

    <!-- About Modal Dialog (Custom Inline Overlay styled as a retro dialog box) -->
    <div class="dialog-overlay" id="about-dialog" style="display: none;">
        <div class="dialog-box window-container">
            <div class="window-titlebar">
                <span class="titlebar-title">About md2web Reader</span>
                <button class="titlebar-btn" id="btn-close-about">×</button>
            </div>
            <div class="window-body dialog-body">
                <div class="dialog-content">
                    <span class="dialog-logo">📖</span>
                    <h3>md2web Standalone Reader</h3>
                    <p>A simplex file reader for markdown and text documentation files compiled with the md2web engine.</p>
                    <p class="license-info">
                        Copyright&nbsp;(c)&nbsp;2026:<br>
                        vatofichor&nbsp;-&nbsp;Sebastian Mass&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[&gt;_&lt;]<br>
                        &amp;&nbsp;Assisted By Gemini Antigravity&nbsp;&nbsp;/|\
                    </p>
                </div>
                <div class="dialog-footer">
                    <button class="dialog-btn" id="btn-ok-about">OK</button>
                </div>
            </div>
        </div>
    </div>

    <script src="res/lib/md2web.js"></script>
    <script src="res/js/app.js"></script>
</body>
</html>
