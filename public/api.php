<?php
// Secure JSON API for md2web Reader
// Copyright (c) 2026:
// vatofichor - Sebastian Mass     [>_<]
// & Assisted By Gemini Antigravity /|\
// Licensed under the MIT License. See LICENSE in the project root.

if (!headers_sent()) {
    header('Content-Type: application/json; charset=utf-8');
}

// Ensure content directory exists and canonicalize its path
$baseDir = realpath(__DIR__ . '/../content');
if (!$baseDir) {
    // Attempt to create content folder in the root if it doesn't exist
    $contentFolder = __DIR__ . '/../content';
    if (!file_exists($contentFolder)) {
        mkdir($contentFolder, 0755, true);
    }
    $baseDir = realpath($contentFolder);
    if (!$baseDir) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'System Error: Content root is unavailable.']);
        exit;
    }
}

if (!function_exists('scan_directory_recursive')) {
    /**
     * Recursively scans a directory for .md and .txt files.
     */
    function scan_directory_recursive($dir, $base_dir) {
        $results = [];
        if (!is_dir($dir)) return $results;

        $items = scandir($dir);
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') continue;

            $path = $dir . '/' . $item;
            if (is_dir($path)) {
                $results = array_merge($results, scan_directory_recursive($path, $base_dir));
            } else if (is_file($path)) {
                $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
                if ($ext === 'md' || $ext === 'txt') {
                    $relPath = str_replace('\\', '/', substr($path, strlen($base_dir) + 1));
                    $results[] = [
                        'name' => $item,
                        'path' => $relPath,
                        'size' => filesize($path),
                        'modified' => filemtime($path)
                    ];
                }
            }
        }

        // Sort files alphabetically by relative path
        usort($results, function($a, $b) {
            return strcmp($a['path'], $b['path']);
        });

        return $results;
    }
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'list':
        try {
            $files = scan_directory_recursive($baseDir, $baseDir);
            echo json_encode(['status' => 'success', 'files' => $files]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to list directory: ' . $e->getMessage()]);
        }
        break;

    case 'read':
        $inputFile = isset($_GET['file']) ? $_GET['file'] : '';
        if ($inputFile === '') {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Parameter "file" is required.']);
            exit;
        }

        // Canonicalize target file path
        $targetPath = realpath($baseDir . '/' . $inputFile);

        // Security check: Must resolve successfully and reside within base directory
        if ($targetPath === false || strpos($targetPath, $baseDir) !== 0) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Access Denied: Directory traversal detected.']);
            exit;
        }

        // Security check: Must be a file and have allowed extension (.md or .txt)
        $ext = strtolower(pathinfo($targetPath, PATHINFO_EXTENSION));
        if (!is_file($targetPath) || ($ext !== 'md' && $ext !== 'txt')) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'File not found or format not allowed.']);
            exit;
        }

        // Read and return the content securely
        $content = @file_get_contents($targetPath);
        if ($content === false) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Unable to read the requested file.']);
            exit;
        }

        echo json_encode([
            'status' => 'success',
            'file' => str_replace('\\', '/', substr($targetPath, strlen($baseDir) + 1)),
            'size' => filesize($targetPath),
            'modified' => filemtime($targetPath),
            'content' => $content
        ]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid or missing action parameter.']);
        break;
}
