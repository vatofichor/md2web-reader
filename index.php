<?php
// Root Router for PHP Built-In Server & Traversal Fallback
// Copyright (c) 2026:
// vatofichor - Sebastian Mass     [>_<]
// & Assisted By Gemini Antigravity /|\
// Licensed under the MIT License. See LICENSE in the project root.

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = ltrim($uri, '/');

// 1. If running under PHP CLI Server, simulate Apache rewrites for assets & public scripts
if (php_sapi_name() === 'cli-server') {
    if (file_exists(__DIR__ . '/' . $uri) && is_file(__DIR__ . '/' . $uri)) {
        return false; // let CLI server serve files in root directly
    }
    if (file_exists(__DIR__ . '/public/' . $uri) && is_file(__DIR__ . '/public/' . $uri)) {
        $filepath = __DIR__ . '/public/' . $uri;
        $mimeType = get_mime_type($filepath);
        header("Content-Type: $mimeType");
        readfile($filepath);
        exit;
    }
}

// 2. Route API requests silently
if ($uri === 'api.php' || strpos($uri, 'api.php/') === 0 || $uri === 'public/api.php') {
    require __DIR__ . '/public/api.php';
    exit;
}

// 3. Route specific public/index.php calls
if ($uri === 'public/index.php' || $uri === 'public/') {
    require __DIR__ . '/public/index.php';
    exit;
}

// 4. Default fallback: Serve public/index.php and pass route for clean URLs
$_GET['route'] = $uri;
require __DIR__ . '/public/index.php';
exit;

function get_mime_type($filename) {
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    $mimes = [
        'css'  => 'text/css',
        'js'   => 'application/javascript',
        'json' => 'application/json',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif'  => 'image/gif',
        'svg'  => 'image/svg+xml',
        'txt'  => 'text/plain',
        'md'   => 'text/markdown',
        'html' => 'text/html',
        'ico'  => 'image/x-icon',
    ];
    return isset($mimes[$ext]) ? $mimes[$ext] : 'application/octet-stream';
}
