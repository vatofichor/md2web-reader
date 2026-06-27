/*
  md2web Reader Client Application
  Copyright (c) 2026:
  vatofichor - Sebastian Mass     [>_<]
  & Assisted By Gemini Antigravity /|\
  Licensed under the MIT License. See LICENSE in the project root.
*/

document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------
    // 1. Core State & Config Initialization
    // --------------------------------------------------
    const state = {
        theme: 'dark-theme', // 'dark-theme' or 'light-theme'
        currentFile: null,   // Currently active server file path or 'local'
        filesList: [],       // Raw manifest from API
        basePath: '/'        // Dynamic base path for pushState routing
    };

    // Calculate base path dynamically to support subfolder deployments
    const initBasePath = () => {
        const baseEl = document.querySelector('base');
        if (baseEl) {
            const parser = document.createElement('a');
            parser.href = baseEl.getAttribute('href');
            state.basePath = parser.pathname;
        } else {
            const pathname = window.location.pathname;
            const parts = pathname.split('/');
            if (parts[parts.length - 1].indexOf('.') !== -1) {
                parts.pop(); // Remove index.php or some-file.md
            }
            state.basePath = parts.join('/') + '/';
        }
        
        // Ensure state.basePath starts and ends with a single slash '/'
        if (!state.basePath.startsWith('/')) {
            state.basePath = '/' + state.basePath;
        }
        if (!state.basePath.endsWith('/')) {
            state.basePath = state.basePath + '/';
        }
        state.basePath = state.basePath.replace(/\/+/g, '/');
    };
    initBasePath();

    // Elements
    const body = document.body;
    const fileTree = document.getElementById('file-tree');
    const viewerContent = document.getElementById('viewer-content');
    const statusText = document.getElementById('status-text');
    const statusTheme = document.getElementById('status-theme');
    const breadcrumbDocName = document.getElementById('current-doc-name');
    const fileSizeBadge = document.getElementById('file-size-badge');
    const localFileInput = document.getElementById('local-file-input');

    // Theme Management
    const initTheme = () => {
        const savedTheme = localStorage.getItem('md2web-theme');
        if (savedTheme === 'light-theme') {
            state.theme = 'light-theme';
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
        } else {
            state.theme = 'dark-theme';
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
        }
        updateThemeStatus();
    };

    const toggleTheme = () => {
        if (state.theme === 'dark-theme') {
            state.theme = 'light-theme';
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
        } else {
            state.theme = 'dark-theme';
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
        }
        localStorage.setItem('md2web-theme', state.theme);
        updateThemeStatus();
    };

    const updateThemeStatus = () => {
        const label = state.theme === 'dark-theme' ? 'Slate Dark' : 'Cream Light';
        statusTheme.textContent = `Theme: ${label}`;
    };

    initTheme();

    // --------------------------------------------------
    // 2. Menu Bars & Dialog Windows
    // --------------------------------------------------
    // Handle menu bar toggle states
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = item.classList.contains('active');
            closeAllMenus();
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    const closeAllMenus = () => {
        menuItems.forEach(item => item.classList.remove('active'));
    };

    document.addEventListener('click', closeAllMenus);

    // Dialog controls
    const aboutDialog = document.getElementById('about-dialog');
    const btnAbout = document.getElementById('btn-about');
    const btnCloseAbout = document.getElementById('btn-close-about');
    const btnOkAbout = document.getElementById('btn-ok-about');
    const btnExit = document.getElementById('btn-exit');

    const showAbout = () => {
        aboutDialog.style.display = 'flex';
        closeAllMenus();
    };

    const hideAbout = () => {
        aboutDialog.style.display = 'none';
    };

    btnAbout.addEventListener('click', showAbout);
    btnCloseAbout.addEventListener('click', hideAbout);
    btnOkAbout.addEventListener('click', hideAbout);
    btnExit.addEventListener('click', () => {
        if (confirm("Are you sure you want to close the reader?")) {
            window.close();
        }
    });

    // Theme toggler action in menu
    document.getElementById('btn-toggle-theme').addEventListener('click', toggleTheme);

    // Sidebar Visibility Toggle
    const sidebar = document.getElementById('sidebar-drawer');
    const btnViewDrawer = document.getElementById('btn-view-drawer');
    btnViewDrawer.addEventListener('click', () => {
        const isHidden = sidebar.style.display === 'none';
        sidebar.style.display = isHidden ? 'flex' : 'none';
        btnViewDrawer.classList.toggle('active', isHidden);
        closeAllMenus();
    });

    // --------------------------------------------------
    // 3. Left Sidebar Resizer
    // --------------------------------------------------
    const resizer = document.getElementById('sidebar-resizer');
    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        body.style.cursor = 'col-resize';
        body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const offsetLeft = e.clientX;
        const minWidth = 180;
        const maxWidth = 400;
        if (offsetLeft >= minWidth && offsetLeft <= maxWidth) {
            sidebar.style.width = offsetLeft + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            body.style.cursor = '';
            body.style.userSelect = '';
        }
    });

    // --------------------------------------------------
    // 4. File Tree Explorer Mapping & Rendering
    // --------------------------------------------------
    const buildTree = (files) => {
        const root = { name: "Root", files: [], dirs: {} };
        files.forEach(f => {
            const parts = f.path.split('/');
            let current = root;
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (!current.dirs[part]) {
                    current.dirs[part] = { name: part, files: [], dirs: {} };
                }
                current = current.dirs[part];
            }
            current.files.push(f);
        });
        return root;
    };

    const renderTree = (node, container) => {
        // Render directories
        for (const dirName in node.dirs) {
            const dirNode = node.dirs[dirName];
            
            const folderItem = document.createElement('div');
            folderItem.className = 'tree-item tree-item-folder tree-folder-title';
            folderItem.textContent = dirNode.name;
            container.appendChild(folderItem);
            
            const folderSubtree = document.createElement('div');
            folderSubtree.className = 'tree-folder';
            container.appendChild(folderSubtree);
            
            // Collapsible folder behavior
            folderItem.addEventListener('click', (e) => {
                e.stopPropagation();
                const isHidden = folderSubtree.style.display === 'none';
                folderSubtree.style.display = isHidden ? 'flex' : 'none';
                folderItem.style.opacity = isHidden ? '1' : '0.65';
            });
            
            renderTree(dirNode, folderSubtree);
        }
        
        // Render files
        node.files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'tree-item tree-item-file';
            fileItem.textContent = file.name;
            fileItem.dataset.path = file.path;
            fileItem.title = file.path;
            
            fileItem.addEventListener('click', (e) => {
                e.stopPropagation();
                loadFile(file.path, true);
            });
            
            container.appendChild(fileItem);
        });
    };

    const loadManifest = () => {
        fileTree.innerHTML = '<div class="tree-loading">Scanning server content...</div>';
        
        fetch('api.php?action=list')
            .then(res => {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    state.filesList = data.files;
                    fileTree.innerHTML = '';
                    if (state.filesList.length === 0) {
                        fileTree.innerHTML = '<div class="tree-loading">No documents found on server.</div>';
                    } else {
                        const tree = buildTree(state.filesList);
                        renderTree(tree, fileTree);
                        highlightActiveTreeItem();
                        
                        // Boot Routing Check
                        handleInitialRoute();
                    }
                } else {
                    throw new Error(data.message || "Failed listing files");
                }
            })
            .catch(err => {
                console.error(err);
                fileTree.innerHTML = `<div class="tree-loading" style="color:var(--accent-red)">Manifest Error: ${err.message}</div>`;
                statusText.textContent = "Status: Server scan failed.";
            });
    };

    const highlightActiveTreeItem = () => {
        const treeItems = document.querySelectorAll('.tree-item-file');
        treeItems.forEach(item => {
            if (item.dataset.path === state.currentFile) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    };

    // --------------------------------------------------
    // 5. Document Loading, Parsing & Rendering
    // --------------------------------------------------
    const loadFile = (filePath, shouldPushState = true) => {
        statusText.textContent = `Status: Fetching ${filePath}...`;
        
        fetch(`api.php?action=read&file=${encodeURIComponent(filePath)}`)
            .then(res => {
                if (res.status === 403) throw new Error("Access Denied: Path Traversal Protected");
                if (res.status === 404) throw new Error("File Not Found");
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    state.currentFile = filePath;
                    highlightActiveTreeItem();
                    
                    // Update routing history
                    if (shouldPushState) {
                        const cleanPath = state.basePath + filePath;
                        history.pushState({ filePath: filePath }, '', cleanPath);
                    }
                    
                    // Render Content
                    renderMarkdown(data.content, filePath, data.size);
                    statusText.textContent = `Status: Loaded ${filePath}`;
                } else {
                    throw new Error(data.message || "Fetch failed");
                }
            })
            .catch(err => {
                console.error(err);
                statusText.textContent = `Status: Load failed - ${err.message}`;
                showErrorInViewer(err.message, filePath);
            });
    };

    const renderMarkdown = (rawContent, filePath, byteSize) => {
        // Render current document metadata in Toolbar
        breadcrumbDocName.textContent = filePath;
        fileSizeBadge.style.display = 'inline-block';
        fileSizeBadge.textContent = formatBytes(byteSize);
        
        // Parse and compile raw markdown using md2web standalone parser engine
        try {
            if (typeof md2web !== 'undefined' && typeof md2web.parseMarkdown === 'function') {
                const compiledHtml = md2web.parseMarkdown(rawContent, filePath);
                viewerContent.innerHTML = compiledHtml;
                viewerContent.scrollTop = 0;
            } else {
                throw new Error("md2web compiler engine is not loaded.");
            }
        } catch (parserErr) {
            console.error(parserErr);
            showErrorInViewer(`Parser Compilation Exception: ${parserErr.message}`, filePath);
        }
    };

    const showWelcome = () => {
        state.currentFile = null;
        highlightActiveTreeItem();
        breadcrumbDocName.textContent = "No file loaded";
        fileSizeBadge.style.display = 'none';
        viewerContent.innerHTML = `
            <div class="welcome-container">
                <div class="welcome-card">
                    <span class="welcome-logo">📖</span>
                    <h2>Welcome to md2web Reader</h2>
                    <p>Select a document from the sidebar drawer to begin reading, or load a local <code>.md</code> or <code>.txt</code> file using the <strong>Load Local</strong> command.</p>
                    <p class="small-text">Brought to you by the md2web compiler engine suite.</p>
                </div>
            </div>
        `;
        statusText.textContent = "Status: Ready";
    };

    const showErrorInViewer = (message, filePath) => {
        breadcrumbDocName.textContent = filePath || "Error Log";
        fileSizeBadge.style.display = 'none';
        viewerContent.innerHTML = `
            <div style="padding: 20px; border: 2px solid var(--accent-red); background-color: var(--bg-field); border-radius: 4px; max-width: 600px; margin: 40px auto;">
                <h3 style="color: var(--accent-red); margin-top: 0; display: flex; align-items: center; gap: 8px;">
                    ⚠️ Error Accessing Document
                </h3>
                <p style="font-family: var(--font-ui); font-size: 0.95rem; margin-top: 10px;">${message}</p>
                <div style="margin-top: 20px; font-family: var(--font-code); font-size: 0.8rem; color: var(--text-muted);">
                    File target: ${filePath}
                </div>
            </div>
        `;
    };

    // --------------------------------------------------
    // 6. Local FileReader Implementation
    // --------------------------------------------------
    const triggerLocalFileLoad = () => {
        localFileInput.click();
        closeAllMenus();
    };

    const handleLocalFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext !== 'md' && ext !== 'txt') {
            alert("Error: Only .md or .txt files are supported.");
            localFileInput.value = '';
            return;
        }

        const reader = new FileReader();
        statusText.textContent = `Status: Reading local file ${file.name}...`;

        reader.onload = (event) => {
            const rawContent = event.target.result;
            state.currentFile = 'local';
            highlightActiveTreeItem();
            
            // Render the raw content
            renderMarkdown(rawContent, `[Local] ${file.name}`, file.size);
            statusText.textContent = `Status: Loaded local file ${file.name}`;
            localFileInput.value = '';
        };

        reader.onerror = (err) => {
            statusText.textContent = "Status: Local read failed.";
            alert("Error reading file locally.");
            localFileInput.value = '';
        };

        reader.readAsText(file);
    };

    // Listeners for local files
    document.getElementById('btn-load-local').addEventListener('click', triggerLocalFileLoad);
    document.getElementById('btn-drawer-local-file').addEventListener('click', triggerLocalFileLoad);
    localFileInput.addEventListener('change', handleLocalFileSelect);

    // --------------------------------------------------
    // 7. Clean URL & PushState Routing Management
    // --------------------------------------------------
    const handleInitialRoute = () => {
        // Check if config injected route
        let route = window.MD2WEB_CONFIG.initialRoute;
        
        // If config route is empty, parse from address bar relative to base path
        if (!route) {
            const pathname = window.location.pathname;
            if (pathname.startsWith(state.basePath)) {
                route = pathname.substring(state.basePath.length);
            }
        }
        
        // Clean route from query strings or slash prefixes
        route = route.replace(/^\/+/, '').split('?')[0];
        
        // If a route exists and is not root or router script, load it
        if (route && route !== 'index.php') {
            // Find if route exists in server manifest
            const match = state.filesList.find(f => f.path.toLowerCase() === route.toLowerCase());
            if (match) {
                loadFile(match.path, false); // Don't pushState for initial load
            } else {
                showErrorInViewer("Document not found in server directory.", route);
            }
        } else {
            showWelcome();
        }
    };

    // Listen for back/forward events
    window.addEventListener('popstate', (e) => {
        const pathname = window.location.pathname;
        if (pathname.startsWith(state.basePath)) {
            const route = pathname.substring(state.basePath.length).replace(/^\/+/, '');
            if (route && route !== 'index.php') {
                loadFile(route, false); // Popstate triggered, don't push state
            } else {
                showWelcome();
            }
        } else {
            showWelcome();
        }
    });

    // Helpers
    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // --------------------------------------------------
    // 8. Boot & Run
    // --------------------------------------------------
    loadManifest();
});
