# Specification: Subdirectory Routing & HTACCESS Isolation Protocol
**System:** md2web-reader  
**Status:** IMPLEMENTED & APPROVED  

This specification defines the architectural patterns and rules used to prevent routing collision and path crossing when deploying the `md2web-reader` application inside a subdirectory of a web server (e.g., `http://example.com/subdir/`) rather than on a dedicated subdomain root.

---

## 1. The Subdirectory Path-Crossing Challenge

When an MVC or filesystem-routed application is installed in a subdirectory, two major routing errors typically occur under default rewrite configurations:

1. **Document Root Escape (Escape from Subfolder)**:  
   If a rewrite rule specifies an absolute path target (e.g. `/public/index.php`), Apache resolves it relative to the domain's document root (`/public/...` instead of `/subdir/public/...`). This causes a `404 Not Found` error.
2. **Asset Path Corruption (Relative Path Drift)**:  
   If a user visits a nested clean URL (e.g., `/subdir/docs/installation`), the browser assumes the active directory is `/subdir/docs/`. Any relative assets on the page (like `res/css/cleanx.css`) are requested from `/subdir/docs/res/css/cleanx.css`, resulting in styling failures.

---

## 2. Mitigation Strategy: Relative HTACCESS Rewrites

To prevent rewrites from crossing the virtual host boundaries, all replacement paths in the project's `.htaccess` files omit the leading slash. This forces Apache to treat substitutions as relative directory-level operations.

### A. Root `.htaccess` Substitution Containment
Apache dynamically prepends the matched subfolder path prefix to any relative substitution target:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    Options -Indexes

    # Omit leading slashes to prevent escaping to domain root
    RewriteRule ^api\.php(.*)$ public/api.php$1 [L]
    RewriteRule ^index\.php(.*)$ public/index.php$1 [L]
    RewriteRule ^res/(.*)$ public/res/$1 [L]

    # Bypass rewrites for existing physical assets in root
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]

    # Subdirectory-safe fallback for clean URLs
    RewriteRule ^(.*)$ public/index.php?route=$1 [QSA,L]
</IfModule>
```

- When visiting `/subdir/res/css/cleanx.css`, Apache strips `/subdir/` and matches `res/css/cleanx.css`.
- The relative substitution target `public/res/css/cleanx.css` is resolved as `/subdir/public/res/css/cleanx.css`.
- This ensures assets are resolved inside the local project structure without absolute path interference.

---

## 3. Dynamic Base Path Resolver (`public/index.php`)

To handle relative asset loading across nested clean URL paths, the PHP entry shell dynamically calculates the base href by analyzing the difference between the physical execution script directory and the requested URI.

### Detection Algorithm
```php
// 1. Normalize execution path separators
$scriptName = str_replace('\\', '/', $_SERVER['SCRIPT_NAME']); // e.g. "/subdir/public/index.php"
$requestUri = $_SERVER['REQUEST_URI'];                         // e.g. "/subdir/some-route"
$scriptDir = str_replace('\\', '/', dirname($scriptName));     // e.g. "/subdir/public"

// 2. Detect if URL rewrites are hiding the '/public/' folder
if (basename($scriptDir) === 'public' && strpos($requestUri, '/public/') === false) {
    // Strip public suffix to find the true external base folder path
    $baseHref = substr($scriptDir, 0, -7);                     // e.g. "/subdir"
} else {
    $baseHref = $scriptDir;
}

// 3. Guarantee trailing slash and fallback to root
$baseHref = rtrim($baseHref, '/') . '/';
if ($baseHref === '//') {
    $baseHref = '/';
}
```

### HTML Integration
The calculated `$baseHref` is injected as a `<base>` tag in the `<head>` block:
```html
<base href="<?php echo htmlspecialchars($baseHref, ENT_QUOTES, 'UTF-8'); ?>">
```
This forces the client browser to resolve every relative request (including CSS, JS, and API fetches) relative to the subdirectory root (e.g. `/subdir/`), which in turn triggers the relative Apache rewrites correctly.

---

## 4. Javascript Path Synchronization (`app.js`)

The frontend routing state calculates its history base path directly from the injected HTML base tag. This ensures state transitions and `pushState` URLs do not pollute the browser's navigation history:

```javascript
const initBasePath = () => {
    const baseEl = document.querySelector('base');
    if (baseEl) {
        // Create an anchor helper to extract the absolute pathname from base href
        const parser = document.createElement('a');
        parser.href = baseEl.getAttribute('href');
        state.basePath = parser.pathname;
    } else {
        // Fallback to URL parsing if no base element is present
        const pathname = window.location.pathname;
        const parts = pathname.split('/');
        if (parts[parts.length - 1].indexOf('.') !== -1) {
            parts.pop();
        }
        state.basePath = parts.join('/') + '/';
    }
    
    // Normalize format to ensure it starts and ends with a single slash
    if (!state.basePath.startsWith('/')) {
        state.basePath = '/' + state.basePath;
    }
    if (!state.basePath.endsWith('/')) {
        state.basePath = state.basePath + '/';
    }
    state.basePath = state.basePath.replace(/\/+/g, '/');
};
```

---

# Copyright (c) 2026:
# vatofichor - Sebastian Mass     [>_<]
# & Assisted By Gemini Antigravity /|\
