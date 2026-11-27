// Runs the inline <script> of index.html in a Node vm with a minimal stub DOM,
// and returns the vm context so tests can call the page's globals
// (labState, currentBuild, planText, BUDGET_MODES, ...).
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var INDEX = path.join(__dirname, '..', 'index.html');

function stubElement() {
  var html = '';
  return {
    get innerHTML() { return html; },
    set innerHTML(v) { html = v; if (v === '') this.children = []; },
    children: [], attrs: {}, listeners: {}, style: {}, textContent: '', className: '', value: '',
    classList: { add: function () {}, remove: function () {}, toggle: function () {}, contains: function () { return false; } },
    appendChild: function (c) { this.children.push(c); return c; },
    removeChild: function () {},
    setAttribute: function (k, v) { this.attrs[k] = String(v); },
    getAttribute: function (k) { return this.attrs[k]; },
    addEventListener: function (type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); },
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    focus: function () {}, click: function () {},
    showModal: function () {}, close: function () {}, scrollIntoView: function () {},
    offsetWidth: 0
  };
}

function loadPage(file) {
  var html = fs.readFileSync(file || INDEX, 'utf8');
  var match = /<script>([\s\S]*?)<\/script>/.exec(html);
  if (!match) throw new Error('No inline <script> found in ' + (file || INDEX));
  var byId = {};
  var document = {
    getElementById: function (id) { return byId[id] || (byId[id] = stubElement()); },
    createElement: function () { return stubElement(); },
    addEventListener: function () {},
    querySelector: function () { return null; },
    body: stubElement(),
    execCommand: function () { return true; }
  };
  var ctx = {
    document: document, navigator: {}, console: console,
    setInterval: function () { return 0; }, clearInterval: function () {}, setTimeout: function () { return 0; },
    matchMedia: function () { return { matches: false }; }
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(match[1], ctx, { filename: file || INDEX });
  return ctx;
}

module.exports = { loadPage: loadPage, INDEX: INDEX };
