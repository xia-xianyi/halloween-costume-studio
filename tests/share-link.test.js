// Shareable creation links (.kiro/specs/shareable-creations).
// Run from the repo root: node --test tests/*.test.js
'use strict';

var test = require('node:test');
var assert = require('node:assert');
var loadPage = require('./load-page').loadPage;

function plain(x) { return JSON.parse(JSON.stringify(x)); }
function click(node) { node.listeners.click.forEach(function (fn) { fn(); }); }

test('ALL_COMBOS is in creation-number order and every hash round-trips, for all 1,728', function () {
  var page = loadPage();
  var modes = Object.keys(page.BUDGET_MODES);
  assert.strictEqual(page.ALL_COMBOS.length, 1728);
  page.ALL_COMBOS.forEach(function (c, i) {
    var n = i + 1;
    var mode = modes[n % modes.length];
    var s = page.withMode(c, mode);
    assert.strictEqual(page.creationNumber(s), n);
    assert.strictEqual(page.buildFor(s).number, n);
    assert.strictEqual(page.labHash(s), '#lab=' + n + '&mode=' + mode);
    assert.deepStrictEqual(plain(page.parseLabHash(page.labHash(s))), plain(s));
  });
});

test('invalid or unrelated hashes are rejected', function () {
  var page = loadPage();
  ['', '#', '#lab', '#rail', '#lab=', '#lab=0', '#lab=1729', '#lab=abc', '#lab=12345',
   '#lab=5&mode=free', '#lab=5&mode=', '#lab=5&mode=NEW', '#lab=-3', ' #lab=5', '#lab=5&mode=thrift&x=1',
   '#lab=5&mode=constructor', '#lab=5&mode=toString'
  ].forEach(function (h) {
    assert.strictEqual(page.parseLabHash(h), null, JSON.stringify(h));
  });
});

test('opening #lab=137&mode=thrift shows creation 137 in Thrift mode and does not rewrite the URL', function () {
  var page = loadPage({ hash: '#lab=137&mode=thrift' });
  assert.strictEqual(page.currentBuild().number, 137);
  assert.strictEqual(page.labState.mode, 'thrift');
  assert.strictEqual(page.__replaced.length, 0);
});

test('a link without a mode keeps the current mode; a bad link leaves the default creation', function () {
  var page = loadPage({ hash: '#lab=1' });
  assert.strictEqual(page.currentBuild().number, 1);
  assert.strictEqual(page.labState.mode, 'new');
  var def = loadPage();
  var bad = loadPage({ hash: '#lab=9999&mode=thrift' });
  assert.deepStrictEqual(plain(bad.labState), plain(def.labState));
});

test('a lab change writes the hash with replaceState; hashchange loads a new creation', function () {
  var page = loadPage();
  var controls = page.document.getElementById('lab-controls');
  // first group (Character), its row of options, the second option (Witch)
  var witch = controls.children[0].children[1].children[1];
  assert.strictEqual(witch.attrs['data-key'], 'witch');
  click(witch);
  assert.strictEqual(page.labState.base, 'witch');
  assert.strictEqual(page.__replaced[page.__replaced.length - 1], page.labHash());

  page.location.hash = '#lab=5&mode=premium';
  page.__listeners.hashchange.forEach(function (fn) { fn(); });
  assert.strictEqual(page.currentBuild().number, 5);
  assert.strictEqual(page.labState.mode, 'premium');
});

test('plan text ends with a rebuild link; earlier lines are unchanged', function () {
  var page = loadPage();
  var lines = page.planText().split('\n');
  var n = page.currentBuild().number;
  assert.strictEqual(lines[lines.length - 1], 'Rebuild this costume: https://studio.example/index.html#lab=' + n + '&mode=new');
  assert.strictEqual(lines[lines.length - 2], '');
  assert.strictEqual(lines[1], 'Creation No. ' + n + ' of 1,728 possible combinations.');
});
