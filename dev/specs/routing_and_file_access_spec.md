# Specification: Routing & Secure File Access Protocol
**System:** md2web-reader  
**Status:** IMPLEMENTED & VERIFIED  

This document serves as the formal specification for the routing matrix and secure file-access controls implemented in the `md2web-reader` standalone application.

---

## 1. Architectural Overview & Directories

The system splits code into an inaccessible parent space (containing content and persistent configurations) and a public folder (`/public`) exposed to the web client.

```
md2web-reader/ (App Root)
├── content/                    # Private Server-Side Markdown & Text Files
├── public/                     # Public Web Root (Assets & Client Interface)
│   ├── api.php                 # Secure JSON API
│   ├── index.php               # Main UI Shell & CLI Server Router
│   └── res/                    # Assets (CSS, JS, Libs)
├── index.php                   # Root CLI Router / Apache Traversal Fallback
└── .htaccess                   # Root Apache Silent Subfolder Rewrite Configuration
```

---

## 2. The Multi-Environment Routing Matrix

To ensure portability across legacy LAMP environments, modern hosting setups, and local developer workstations, the application dynamically resolves routes under four configurations:

| Hosting Profile | URL Root | Physical Web Root | Router Invoked | Clean URL Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **1. LAMP (Mapped to Root)** | `http://domain.com/` | `md2web-reader/` | Root `.htaccess` + `/public/index.php` | Root `.htaccess` rewrites clean paths to `public/index.php?route=$1` |
| **2. LAMP (Mapped to Public)** | `http://domain.com/` | `md2web-reader/public/` | `public/.htaccess` + `public/index.php` | `public/.htaccess` rewrites clean paths to `index.php?route=$1` |
| **3. PHP CLI Server (Root)** | `http://localhost:8000/` | `md2web-reader/` | Root `index.php` | Root `index.php` manually reads assets and passes clean routes to `public/index.php` |
| **4. PHP CLI Server (Public)** | `http://localhost:8000/` | `md2web-reader/public/` | `public/index.php` | CLI server is launched targeting the public entry point; `public/index.php` intercepts non-existent paths |

---

## 3. Rewrite & Router Specifications

### A. Root `.htaccess` (Apache Subdirectory-Safe Rewriting)
Located in the project root, this configuration silently maps asset requests to the `public/` folder, allows real files (like files inside `content/` if needed, though they are protected) to bypass rewrites, and sends clean URLs to `/public/index.php`.

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    Options -Indexes

    # 1. Silently rewrite asset & entry requests to the public directory
    RewriteRule ^api\.php(.*)$ public/api.php$1 [L]
    RewriteRule ^index\.php(.*)$ public/index.php$1 [L]
    RewriteRule ^res/(.*)$ public/res/$1 [L]

    # 2. Bypass rewrites if the requested resource exists in the current root folder
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]

    # 3. Rewrite clean document URLs to public/index.php using query parameters
    RewriteRule ^(.*)$ public/index.php?route=$1 [QSA,L]
</IfModule>
```

### B. Inner `/public/.htaccess` (Apache Mapped to `/public`)
Handles URL rewriting when the web server root is set directly to the `public/` directory.

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    Options -Indexes

    # Bypass if file/directory exists inside public
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]

    # Rewrite clean routes directly to local index.php
    RewriteRule ^(.*)$ index.php?route=$1 [QSA,L]
</IfModule>
```

### C. Root `index.php` (PHP Built-in Server Router)
Simulates Apache's rewrite capabilities when developers start the server in the parent directory (e.g. `php -S localhost:8000` or `php -S localhost:8000 index.php`).

- **Asset Mapping**: Checks if requests map to a file under `/public/` and serves it with the correct content headers (`get_mime_type()`).
- **Clean URL Fallback**: Assigns `$_GET['route']` with the URI path and requires `public/index.php` to hydrate the shell.

---

## 4. Secure File Access Protocol (`public/api.php`)

To prevent Arbitrary File Read and Local File Inclusion (LFI) vulnerabilities, `public/api.php` enforces a strict sanitization protocol before reading any server-side file.

### Path Resolution Flow
```
Client Request (?file=01_Basics/../idea.txt)
     │
     ▼
[Step 1: Canonicalize Base Content Path]
$baseDir = realpath(__DIR__ . '/../content')
     │
     ▼
[Step 2: Canonicalize Requested Path]
$targetPath = realpath($baseDir . '/' . $inputFile)
     │
     ├───► [Resolution Failed (realpath returns false)] ──► HTTP 403 Access Denied
     │
     ▼
[Step 3: Prefix Match Validation]
strpos($targetPath, $baseDir) === 0
     │
     ├───► [Prefix does not match (Traversal Hack)] ──────► HTTP 403 Access Denied
     │
     ▼
[Step 4: Whitelist File Check]
is_file($targetPath) && (ext is 'md' or 'txt')
     │
     ├───► [Check fails (directory or invalid type)] ─────► HTTP 404 Not Found
     │
     ▼
Read file contents & return JSON Payload (HTTP 200)
```

### Secure Execution Snippet
```php
// 1. Establish base directory context
$baseDir = realpath(__DIR__ . '/../content');

// 2. Canonicalize requested file
$inputFile = isset($_GET['file']) ? $_GET['file'] : '';
$targetPath = realpath($baseDir . '/' . $inputFile);

// 3. Traversal guard
if ($targetPath === false || strpos($targetPath, $baseDir) !== 0) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access Denied: Traversal detected.']);
    exit;
}

// 4. Content-type and extension guard
$ext = strtolower(pathinfo($targetPath, PATHINFO_EXTENSION));
if (!is_file($targetPath) || ($ext !== 'md' && $ext !== 'txt')) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'File not found.']);
    exit;
}

// 5. Output file
$content = file_get_contents($targetPath);
```

---

## 5. Client Routing & History Sync

The client-side application (`public/res/js/app.js`) handles state syncing using HTML5 History APIs.

1. **Subfolder-Safe Base Path**: On boot, the client calculates the base folder path dynamically:
   ```javascript
   const pathname = window.location.pathname;
   const parts = pathname.split('/');
   if (parts[parts.length - 1].indexOf('.') !== -1) {
       parts.pop(); // Remove files like index.php or some-doc.md
   }
   state.basePath = parts.join('/') + '/';
   ```
2. **Push State**: Selecting a file from the explorer pushes the relative file route clean URL:
   ```javascript
   const cleanPath = state.basePath + filePath;
   history.pushState({ filePath: filePath }, '', cleanPath);
   ```
3. **Pop State**: When navigating back or forward, the client intercepts the `popstate` event, extracts the route relative to the calculated base path, and retrieves the file from `api.php`.

---

# Copyright (c) 2026:
# vatofichor - Sebastian Mass     [>_<]
# & Assisted By Gemini Antigravity /|\
