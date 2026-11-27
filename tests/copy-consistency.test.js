// The steering rule is "every number shown is computed from the data, never
// typed twice". A few figures are static copy (hero stats, meta description,
// section text, README). This test pins every one of them to the data, so a
// new costume, twist, prop or palette cannot leave stale numbers behind.
// Run from the repo root: node --test tests/*.test.js
'use strict';

var test = require('node:test');
var assert = require('node:assert');
var fs = require('fs');
var path = require('path');
var loadPage = require('./load-page').loadPage;

var ROOT = path.join(__dirname, '..');
// Drop the base64 image lines; they are megabytes of noise for these checks.
var HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
  .split('\n').filter(function (l) { return l.length < 5000; }).join('\n');
var README = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
var WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

function counts(page) {
  var sizes = [page.BASES, page.TWISTS, page.PROPS, page.PALETTES].map(function (t) { return Object.keys(t).length; });
  var maxSpook = 0;
  page.ALL_COMBOS.forEach(function (c) { maxSpook = Math.max(maxSpook, page.buildFor(page.withMode(c, 'new')).spook); });
  return {
    costumes: page.COSTUMES.length,
    sizes: sizes,
    combos: sizes.reduce(function (a, b) { return a * b; }, 1),
    parts: sizes.reduce(function (a, b) { return a + b; }, 0),
    fastest: Math.min.apply(null, page.COSTUMES.map(function (c) { return page.timeMins(c); })),
    maxSpook: maxSpook
  };
}
function all(re, text) {
  var out = [], m;
  while ((m = re.exec(text)) !== null) out.push(m);
  return out;
}

test('every "x,xxx" figure in the page and README is the number of lab creations', function () {
  var page = loadPage();
  var want = page.fmtInt(counts(page).combos);
  [['index.html', HTML], ['README.md', README]].forEach(function (f) {
    // standalone figures only: skip things like the font URL's "wght@0,400;0,600"
    var found = all(/(?<![\w@;,.])\d{1,3}(?:,\d{3})+(?![\w;,])/g, f[1]);
    assert.ok(found.length > 0, f[0] + ' mentions the combination count');
    found.forEach(function (m) { assert.strictEqual(m[0], want, f[0] + ': "' + m[0] + '"'); });
  });
  assert.strictEqual(page.TOTAL_COMBOS, page.ALL_COMBOS.length);
});

test('costume counts in words and digits match COSTUMES', function () {
  var page = loadPage();
  var c = counts(page);
  var word = WORDS[c.costumes];
  var phrases = all(/\b(\w+) (?:Halloween costume |costume )?builds\b/gi, HTML)
    .filter(function (m) { return WORDS.indexOf(m[1].toLowerCase()) !== -1; });
  assert.ok(phrases.length >= 3, 'expected the "Eight ... builds" phrases');
  phrases.forEach(function (m) { assert.strictEqual(m[1].toLowerCase(), word, m[0]); });
  var stat = /<strong>(\d+)<\/strong><span>ready-made builds<\/span>/.exec(HTML);
  assert.ok(stat, 'hero stat for builds');
  assert.strictEqual(Number(stat[1]), c.costumes);
  all(/\b(\d+) original costumes\b/g, README).forEach(function (m) { assert.strictEqual(Number(m[1]), c.costumes, 'README: ' + m[0]); });
  page.COSTUMES.forEach(function (costume) {
    assert.ok(README.indexOf(costume.name) !== -1 || README.indexOf(page.BASES[costume.id].label) !== -1,
      'README lists ' + costume.name);
  });
});

test('hero stats for fastest build and top spook level match the data', function () {
  var page = loadPage();
  var c = counts(page);
  var fastest = /<strong>(\d+) min<\/strong><span>fastest costume<\/span>/.exec(HTML);
  assert.ok(fastest, 'hero stat for fastest costume');
  assert.strictEqual(Number(fastest[1]), c.fastest);
  var spook = /<strong>(\d) \/ 5<\/strong><span>top spook level<\/span>/.exec(HTML);
  assert.ok(spook, 'hero stat for top spook level');
  assert.strictEqual(Number(spook[1]), c.maxSpook);
});

test('part and option counts in copy match the lab tables', function () {
  var page = loadPage();
  var c = counts(page);
  [['index.html', HTML], ['README.md', README]].forEach(function (f) {
    all(/\b(\d+) parts\b/g, f[1]).forEach(function (m) { assert.strictEqual(Number(m[1]), c.parts, f[0] + ': ' + m[0]); });
    all(/(\d+) characters × (\d+) twists × (\d+) props × (\d+) palettes/g, f[1]).forEach(function (m) {
      assert.deepStrictEqual(m.slice(1, 5).map(Number), c.sizes, f[0] + ': ' + m[0]);
    });
    all(/\b(\w+) illustrations\b/gi, f[1]).forEach(function (m) {
      if (WORDS.indexOf(m[1].toLowerCase()) === -1) return;
      assert.strictEqual(m[1].toLowerCase(), WORDS[c.costumes + 1], f[0] + ': ' + m[0] + ' (costumes + hero)');
    });
  });
});

test('the README names every steering doc, spec and hook that exists in .kiro', function () {
  ['steering', 'specs', 'hooks'].forEach(function (dir) {
    fs.readdirSync(path.join(ROOT, '.kiro', dir)).forEach(function (name) {
      if (dir === 'hooks' && !/\.json$/.test(name)) return;
      assert.ok(README.indexOf(name.replace(/\.md$/, '')) !== -1, 'README mentions .kiro/' + dir + '/' + name);
    });
  });
});
