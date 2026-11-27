// Automated checks for the Costume Lab budget and the inline script.
// Run from the repo root: node --test tests/*.test.js
'use strict';

var test = require('node:test');
var assert = require('node:assert');
var path = require('path');
var childProcess = require('child_process');
var loadPage = require('./load-page').loadPage;
var INDEX = require('./load-page').INDEX;

var ROOT = path.join(__dirname, '..');
var CHECKER = path.join(ROOT, '.kiro', 'hooks', 'check-inline-script.js');
var BUDGET_HEADING = 'Estimated budget (USD, rough DIY estimate):';
var PARTS = ['Character', 'Twist', 'Prop', 'Palette'];
var EXPECTED_MODES = { thrift: 0.5, new: 1, premium: 1.8 };

// "$5" -> [5, 5]; "$30–$65" -> [30, 65]
function parseRange(text) {
  var m = /^\$(\d+)(?:–\$(\d+))?$/.exec(text);
  assert.ok(m, 'not a USD range: "' + text + '"');
  var lo = Number(m[1]);
  return [lo, m[2] === undefined ? lo : Number(m[2])];
}

// Pull the budget block out of the plan text.
function parseBudgetBlock(plan) {
  var lines = plan.split('\n');
  var start = lines.indexOf(BUDGET_HEADING);
  assert.ok(start > -1, 'plan text has no budget heading');
  var modeLine = lines[start + 1];
  var parts = lines.slice(start + 2, start + 6).map(function (line, i) {
    var m = /^- (\w+) \((.+)\): (\S+)$/.exec(line);
    assert.ok(m, 'bad part line ' + (i + 1) + ': "' + line + '"');
    return { part: m[1], label: m[2], range: parseRange(m[3]) };
  });
  var totalMatch = /^Total estimate: (\S+)$/.exec(lines[start + 6]);
  assert.ok(totalMatch, 'bad total line: "' + lines[start + 6] + '"');
  return { modeLine: modeLine, parts: parts, total: parseRange(totalMatch[1]) };
}

// A deterministic sample: every 7th creation (7 shares no factor with 6 or 8),
// which hits every character, twist, prop and palette several times.
function sampleCombos(page) {
  var groups = [page.BASES, page.TWISTS, page.PROPS, page.PALETTES].map(Object.keys);
  var size = groups.reduce(function (n, g) { return n * g.length; }, 1);
  var combos = [];
  for (var i = 0; i < size; i += 7) {
    var rest = i, combo = [];
    for (var g = groups.length - 1; g >= 0; g--) {
      combo[g] = groups[g][rest % groups[g].length];
      rest = Math.floor(rest / groups[g].length);
    }
    combos.push(combo);
  }
  return { combos: combos, groups: groups };
}

test('inline script passes .kiro/hooks/check-inline-script.js', function () {
  var run = childProcess.spawnSync(process.execPath, [CHECKER, INDEX], { cwd: ROOT, encoding: 'utf8' });
  assert.strictEqual(run.status, 0, 'checker failed:\n' + run.stdout + run.stderr);
  assert.match(run.stdout, /^OK: \d+ inline script\(s\) in .*index\.html passed the syntax check\./);
});

test('budget modes are Thrift 0.5, Buy new 1.0, Premium 1.8, default Buy new', function () {
  var page = loadPage();
  assert.deepStrictEqual(Object.keys(page.BUDGET_MODES), Object.keys(EXPECTED_MODES));
  Object.keys(EXPECTED_MODES).forEach(function (k) {
    assert.strictEqual(page.BUDGET_MODES[k].multiplier, EXPECTED_MODES[k], k);
  });
  assert.strictEqual(page.labState.mode, 'new');
});

test('plan-text budget total equals the sum of the per-part estimates in every mode', function (t) {
  var page = loadPage();
  var sample = sampleCombos(page);
  var tables = [page.BASES, page.TWISTS, page.PROPS, page.PALETTES];
  var keys = ['base', 'twist', 'prop', 'palette'];

  // the sample must cover every option of every part
  sample.groups.forEach(function (g, gi) {
    g.forEach(function (k) {
      assert.ok(sample.combos.some(function (c) { return c[gi] === k; }), 'sample misses ' + keys[gi] + ' ' + k);
    });
  });

  Object.keys(page.BUDGET_MODES).forEach(function (modeKey) {
    var mode = page.BUDGET_MODES[modeKey];
    var mult = '×' + mode.multiplier.toFixed(1);
    sample.combos.forEach(function (combo) {
      combo.forEach(function (k, i) { page.labState[keys[i]] = k; });
      page.labState.mode = modeKey;
      var where = modeKey + ' ' + combo.join('/');
      var block = parseBudgetBlock(page.planText());

      assert.strictEqual(block.modeLine, 'Purchase mode: ' + mode.label + ' (' + mult + ') — ' + mode.desc, where);

      var sum = [0, 0];
      block.parts.forEach(function (p, i) {
        var option = tables[i][combo[i]];
        assert.strictEqual(p.part, PARTS[i], where);
        assert.strictEqual(p.label, option.label, where);
        // each part is the stored cost scaled by the mode, rounded to whole USD
        assert.deepStrictEqual(p.range, [
          Math.round(option.cost[0] * mode.multiplier),
          Math.round(option.cost[1] * mode.multiplier)
        ], where + ' ' + p.part);
        assert.ok(p.range[0] <= p.range[1], where + ' ' + p.part + ' min > max');
        sum[0] += p.range[0];
        sum[1] += p.range[1];
      });
      assert.deepStrictEqual(block.total, sum, where + ' total');
    });
    t.diagnostic(mode.label + ': ' + sample.combos.length + ' combinations checked');
  });
});
