#!/usr/bin/env node
// Syntax-checks the inline <script> blocks (no src attribute) of an HTML file
// without executing them. Usage: node check-inline-script.js [file]
// Defaults to index.html in the current directory.
'use strict';

var fs = require('fs');
var vm = require('vm');

var file = process.argv[2] || 'index.html';
var html;
try {
  html = fs.readFileSync(file, 'utf8');
} catch (e) {
  console.error('Cannot read ' + file + ': ' + e.message);
  process.exit(2);
}

var re = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
var match;
var checked = 0;
var errors = 0;

function lineAt(text, index) {
  var line = 1;
  for (var i = text.indexOf('\n'); i !== -1 && i < index; i = text.indexOf('\n', i + 1)) {
    line++;
  }
  return line;
}

while ((match = re.exec(html)) !== null) {
  var attrs = match[1];
  var code = match[2];
  if (/\bsrc\s*=/i.test(attrs)) continue;
  var typeMatch = /\btype\s*=\s*["']?([^"'\s>]+)/i.exec(attrs);
  if (typeMatch && !/^(text\/javascript|application\/javascript)$/i.test(typeMatch[1])) continue;
  if (!code.trim()) continue;

  checked++;
  // Line of the first character of the script body (the char after '>').
  var bodyStart = match.index + match[0].indexOf('>') + 1;
  var startLine = lineAt(html, bodyStart);

  try {
    new vm.Script(code, { filename: file });
  } catch (err) {
    errors++;
    var scriptLine = null;
    var m = /:(\d+)\s*$/m.exec((err.stack || '').split('\n')[0]);
    if (m) scriptLine = parseInt(m[1], 10);
    var msg = err.name + ': ' + err.message;
    if (scriptLine) {
      // vm reports lines relative to the script body, so offset by startLine - 1.
      var abs = startLine + scriptLine - 1;
      console.error('SYNTAX ERROR in ' + file + ' at line ' + abs +
        ' (line ' + scriptLine + ' of inline script #' + checked + '): ' + msg);
      var srcLine = code.split('\n')[scriptLine - 1] || '';
      console.error('  > ' + srcLine.slice(0, 200));
    } else {
      console.error('SYNTAX ERROR in inline script #' + checked + ' (line unknown): ' + msg);
    }
  }
}

if (errors) {
  console.error(errors + ' inline script(s) with syntax errors.');
  process.exit(1);
}
console.log('OK: ' + checked + ' inline script(s) in ' + file + ' passed the syntax check.');
