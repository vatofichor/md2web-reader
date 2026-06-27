/*
  Copyright (c) 2026:
  vatofichor - Sebastian Mass     [>_<]
  & Assisted By Gemini Antigravity /|\
  Licensed under the MIT License. See LICENSE in the project root.
*/

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.md2web = factory();
    }
}(typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : this), function() {
    'use strict';

    // Polyfill for String.prototype.trim (ES3 compatibility for cscript)
    if (!String.prototype.trim) {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    function escapeAttribute(str) {
        if (!str) return '';
        return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function sanitizeUrl(url) {
        if (!url) return '#';
        // Strip control characters and whitespaces for protocol parsing
        var cleaned = url.replace(/[\x00-\x20\s]/g, '');
        var protoMatch = cleaned.match(/^([a-z0-9+.\-]+):/i);
        if (protoMatch) {
            var proto = protoMatch[1].toLowerCase();
            if (proto !== 'http' && proto !== 'https') {
                return '#';
            }
        }
        return url.replace(/^\s+|\s+$/g, '');
    }

    function parseMarkdown(md, relativePath) {
        if (!md) return '';

        var html = md.replace(/\r\n/g, '\n');

        // Escape simple HTML tags but keep math tags clean
        html = html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // 1. Protect code blocks from parsing
        var codeBlocks = [];
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function(match, lang, code) {
            var placeholder = '<!--CODEBLOCK-' + codeBlocks.length + '-->';
            // Restore angle brackets inside code block
            var cleanCode = code
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');
            codeBlocks.push('<pre><code class="language-' + lang + '">' + cleanCode.trim() + '</code></pre>');
            return placeholder;
        });

        // 1b. Protect inline code from parsing
        var inlineCodePlaceholders = [];
        html = html.replace(/``([\s\S]*?)``|`([^`\n]+)`/g, function(match, codeDouble, codeSingle) {
            var code = (codeDouble !== undefined && codeDouble !== "") ? codeDouble : codeSingle;
            var placeholder = '<!--INLINECODE-' + inlineCodePlaceholders.length + '-->';
            var cleanCode = code
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');
            inlineCodePlaceholders.push('<code>' + cleanCode + '</code>');
            return placeholder;
        });

        // 2. Parse Markdown Tables
        var tableBlocks = [];
        var lines = html.split('\n');
        var newLines = [];
        var i = 0;
        while (i < lines.length) {
            var line = lines[i];
            var trimmed = line.trim();
            
            // Check if the current line starts with '|'
            if (trimmed.indexOf('|') === 0) {
                // Check if there is a next line that is a divider row
                if (i + 1 < lines.length) {
                    var nextLine = lines[i + 1].trim();
                    // Divider row pattern: starts with '|', contains only pipes, hyphens, colons, and whitespace (must contain at least one hyphen)
                    var isDivider = nextLine.indexOf('|') === 0 && /^\|[ \t|:\-]+$/.test(nextLine) && nextLine.indexOf('-') !== -1;
                    
                    if (isDivider) {
                        // It's a table! Gather all consecutive lines starting with '|'
                        var tableRows = [];
                        tableRows.push(trimmed); // header row
                        tableRows.push(nextLine); // divider row
                        
                        var j = i + 2;
                        while (j < lines.length) {
                            var consecutiveLine = lines[j].trim();
                            if (consecutiveLine.indexOf('|') === 0) {
                                tableRows.push(consecutiveLine);
                                j++;
                            } else {
                                break;
                            }
                        }
                        
                        // Render the table block
                        tableBlocks.push(buildTable(tableRows));
                        newLines.push('<!--TABLEBLOCK-' + (tableBlocks.length - 1) + '-->');
                        
                        // Advance outer loop index to the line after the table
                        i = j;
                        continue;
                    }
                }
            }
            
            // Not a table row, keep it as is
            newLines.push(lines[i]);
            i++;
        }
        html = newLines.join('\n');

        // 3. Headings (using horizontal whitespace matching to prevent empty line consumption)
        html = html.replace(/^[ \t]*######[ \t]+(.*)$/gm, '<h6>$1</h6>');
        html = html.replace(/^[ \t]*#####[ \t]+(.*)$/gm, '<h5>$1</h5>');
        html = html.replace(/^[ \t]*####[ \t]+(.*)$/gm, '<h4>$1</h4>');
        html = html.replace(/^[ \t]*###[ \t]+(.*)$/gm, '<h3>$1</h3>');
        html = html.replace(/^[ \t]*##[ \t]+(.*)$/gm, '<h2>$1</h2>');
        html = html.replace(/^[ \t]*#[ \t]+(.*)$/gm, '<h1>$1</h1>');

        // 4. Blockquotes
        html = html.replace(/^[ \t]*&gt;[ \t]*(.*)$/gm, '<blockquote>$1</blockquote>');
        html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');

        // 5. Horizontal rules
        html = html.replace(/^[ \t]*---$/gm, '<hr>');

        // 6. Lists
        html = html.replace(/^[ \t]*[\*\-][ \t]+(.*)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
        html = html.replace(/<\/ul>\n<ul>/g, '');

        // 7. Math symbols inline ($a$ or $\alpha$)
        html = html.replace(/\$([^\$]+)\$/g, '<span class="math">$1</span>');

        // 8. Bold / Italic / Images / Links (no code inline since it is protected)
        html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
        html = html.replace(/_([^\s_][^\n_]*?[^\s_]|[^\s_])_/g, '<em>$1</em>');

        // 8b. Markdown Images with relative URL resolution
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function(match, alt, src) {
            var sanitizedSrc = sanitizeUrl(src);
            var resolvedSrc = resolveUrl(sanitizedSrc, relativePath);
            var safeSrc = escapeAttribute(resolvedSrc);
            var safeAlt = escapeAttribute(alt);
            return '<img src="' + safeSrc + '" alt="' + safeAlt + '" class="article-hero" style="max-width: 100%; height: auto; border-radius: 4px; display: block; margin: 20px auto; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">';
        });

        // 8c. Markdown Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(match, text, href) {
            var safeHref = escapeAttribute(sanitizeUrl(href));
            return '<a href="' + safeHref + '" target="_blank">' + text + '</a>';
        });

        // 9. Paragraph wrap
        var paragraphs = html.split(/\n\n+/);
        for (var i = 0; i < paragraphs.length; i++) {
            var p = paragraphs[i].trim();
            if (p.indexOf('<h') === 0 || p.indexOf('<blockquote') === 0 || p.indexOf('<ul') === 0 || p.indexOf('<hr') === 0 || p.indexOf('<!--') === 0 || p.indexOf('<table') === 0) {
                continue;
            }
            paragraphs[i] = '<p>' + p.replace(/\n/g, '<br>') + '</p>';
        }
        html = paragraphs.join('\n\n');

        // 10. Restore code blocks, inline code, and tables
        for (var index = 0; index < codeBlocks.length; index++) {
            html = html.replace('<!--CODEBLOCK-' + index + '-->', codeBlocks[index]);
        }
        for (var index = 0; index < inlineCodePlaceholders.length; index++) {
            html = html.replace('<!--INLINECODE-' + index + '-->', inlineCodePlaceholders[index]);
        }
        for (var index = 0; index < tableBlocks.length; index++) {
            html = html.replace('<!--TABLEBLOCK-' + index + '-->', tableBlocks[index]);
        }

        // Restore Greek and math symbol entities in final html output
        html = html
            .replace(/&amp;(\w+);/g, '&$1;')
            .replace(/\\alpha/g, '&alpha;')
            .replace(/\\beta/g, '&beta;')
            .replace(/\\gamma/g, '&gamma;')
            .replace(/\\delta/g, '&delta;')
            .replace(/\\epsilon/g, '&epsilon;')
            .replace(/\\zeta/g, '&zeta;')
            .replace(/\\eta/g, '&eta;')
            .replace(/\\theta/g, '&theta;')
            .replace(/\\iota/g, '&iota;')
            .replace(/\\kappa/g, '&kappa;')
            .replace(/\\lambda/g, '&lambda;')
            .replace(/\\mu/g, '&mu;')
            .replace(/\\nu/g, '&nu;')
            .replace(/\\xi/g, '&xi;')
            .replace(/\\omicron/g, '&omicron;')
            .replace(/\\pi/g, '&pi;')
            .replace(/\\rho/g, '&rho;')
            .replace(/\\sigma/g, '&sigma;')
            .replace(/\\tau/g, '&tau;')
            .replace(/\\upsilon/g, '&upsilon;')
            .replace(/\\phi/g, '&phi;')
            .replace(/\\chi/g, '&chi;')
            .replace(/\\psi/g, '&psi;')
            .replace(/\\omega/g, '&omega;')
            .replace(/\\text\{([^\}]+)\}/g, '$1');

        return html;
    }

    function buildTable(rows) {
        var html = '<table>';
        var alignments = [];
        var hasHeader = false;

        if (rows.length > 1) {
            hasHeader = true;
            // Parse alignments from rows[1] (divider row)
            var dividerCells = rows[1].replace(/^\||\|$/g, '').split('|');
            for (var k = 0; k < dividerCells.length; k++) {
                var cell = dividerCells[k].trim();
                if (cell.indexOf(':') === 0 && cell.lastIndexOf(':') === cell.length - 1) {
                    alignments.push('center');
                } else if (cell.lastIndexOf(':') === cell.length - 1) {
                    alignments.push('right');
                } else {
                    alignments.push('left');
                }
            }
        }

        for (var i = 0; i < rows.length; i++) {
            if (i === 1 && hasHeader) continue;

            var row = rows[i];
            var cells = row.replace(/^\||\|$/g, '').split('|');

            html += '<tr>';
            for (var j = 0; j < cells.length; j++) {
                var cellInlineCodes = [];
                var cellHtml = cells[j].trim();
                cellHtml = cellHtml.replace(/``([\s\S]*?)``|`([^`\n]+)`/g, function(match, codeDouble, codeSingle) {
                    var code = (codeDouble !== undefined && codeDouble !== "") ? codeDouble : codeSingle;
                    cellInlineCodes.push('<code>' + code + '</code>');
                    return '<!--CELLCODE-' + (cellInlineCodes.length - 1) + '-->';
                });
                cellHtml = cellHtml
                    .replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*([^\*]+)\*/g, '<em>$1</em>')
                    .replace(/\$([^\$]+)\$/g, '<span class="math">$1</span>')
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(match, text, href) {
                        var safeHref = escapeAttribute(sanitizeUrl(href));
                        return '<a href="' + safeHref + '" target="_blank">' + text + '</a>';
                    });
                for (var c = 0; c < cellInlineCodes.length; c++) {
                    cellHtml = cellHtml.replace('<!--CELLCODE-' + c + '-->', cellInlineCodes[c]);
                }

                var align = alignments[j] || 'left';
                var styleAttr = ' style="text-align: ' + align + ';"';

                if (i === 0 && hasHeader) {
                    html += '<th' + styleAttr + '>' + cellHtml + '</th>';
                } else {
                    html += '<td' + styleAttr + '>' + cellHtml + '</td>';
                }
            }
            html += '</tr>';
        }
        html += '</table>';
        return html;
    }

    function resolveUrl(url, articlePath) {
        if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0 || url.indexOf('/') === 0) {
            return url;
        }
        if (!articlePath) return url;
        var parts = articlePath.split('/');
        parts.pop(); // remove file name

        var urlParts = url.split('/');
        while (urlParts[0] === '..') {
            urlParts.shift();
            parts.pop();
        }
        if (parts.length > 0) {
            return parts.join('/') + '/' + urlParts.join('/');
        } else {
            return urlParts.join('/');
        }
    }

    // Return public module namespace API
    return {
        parseMarkdown: parseMarkdown
    };
}));

// Node.js CLI Execution Wrapper
if (typeof process !== 'undefined' && process.argv && process.argv.length > 2) {
    if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
        var fs = require('fs');
        var inputPath = process.argv[2];
        var outputPath = process.argv[3];
        var relPath = process.argv[4] || '';
        if (fs.existsSync(inputPath)) {
            var mdContent = fs.readFileSync(inputPath, 'utf8');
            var parser = module.exports;
            var htmlContent = parser.parseMarkdown(mdContent, relPath);
            fs.writeFileSync(outputPath, htmlContent, 'utf8');
            process.exit(0);
        } else {
            console.error("Error: Input file does not exist: " + inputPath);
            process.exit(1);
        }
    }
}

// Windows Script Host (cscript.exe) Execution Wrapper
if (typeof WScript !== 'undefined') {
    var args = WScript.Arguments;
    if (args.length < 2) {
        WScript.Echo("Usage: cscript md2web.js <input_md_file> <output_html_file> [<relative_path>]");
        WScript.Quit(1);
    }
    var inputPath = args(0);
    var outputPath = args(1);
    var relPath = args.length > 2 ? args(2) : "";

    var fso = new ActiveXObject("Scripting.FileSystemObject");
    if (!fso.FileExists(inputPath)) {
        WScript.Echo("Error: Input file does not exist: " + inputPath);
        WScript.Quit(1);
    }

    // Read MD file using ADODB.Stream for UTF-8 compatibility
    var readStream = new ActiveXObject("ADODB.Stream");
    readStream.Type = 2; // text
    readStream.Charset = "utf-8";
    readStream.Open();
    readStream.LoadFromFile(inputPath);
    var mdContent = readStream.ReadText();
    readStream.Close();

    // Parse markdown content using global md2web namespace
    var htmlContent = md2web.parseMarkdown(mdContent, relPath);

    // Save output HTML using ADODB.Stream for UTF-8 compatibility
    var writeStream = new ActiveXObject("ADODB.Stream");
    writeStream.Type = 2; // text
    writeStream.Charset = "utf-8";
    writeStream.Open();
    writeStream.WriteText(htmlContent);
    writeStream.SaveToFile(outputPath, 2); // 2 = Overwrite
    writeStream.Close();

    WScript.Quit(0);
}
