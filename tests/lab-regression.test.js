// Regression guard: every one of the 1,728 lab creations, in every purchase
// mode, must produce the same name, creation number, spook level, build time,
// budget label, cost figures and text (description, carrying line, materials,
// palette) as main did before the optimization pass.
// The baseline is tests/fixtures/lab-baseline.json (see its "note" field).
// Run from the repo root: node --test tests/*.test.js
'use strict';

var test = require('node:test');
var assert = require('node:assert');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var loadPage = require('./load-page').loadPage;

var BASELINE = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'lab-baseline.json'), 'utf8'));

test('baseline covers all 1,728 creations and the three purchase modes', function () {
  var page = loadPage();
  assert.strictEqual(BASELINE.rows.length, 1728);
  assert.deepStrictEqual(BASELINE.modes, Object.keys(page.BUDGET_MODES));
});

test('every creation in every mode matches the pre-optimization baseline', function (t) {
  var page = loadPage();
  var digest = crypto.createHash('sha256');
  BASELINE.rows.forEach(function (row) {
    var keys = row[1].split('/');
    var s = page.labState;
    s.base = keys[0]; s.twist = keys[1]; s.prop = keys[2]; s.palette = keys[3];
    BASELINE.modes.forEach(function (modeKey, mi) {
      s.mode = modeKey;
      var b = page.currentBuild();
      var where = '#' + row[0] + ' ' + row[1] + ' ' + modeKey;
      if (mi === 0) {
        assert.deepStrictEqual([b.number, b.name, b.spook, b.time, b.budgetLabel],
          [row[0], row[2], row[3], row[4], row[5]], where);
        digest.update(JSON.stringify([b.number, b.carrying, b.desc, b.materials, b.palette.label]) + '\n');
      }
      var costs = b.costs.map(function (c) { return c.cost; }).concat([b.costTotal]);
      assert.deepStrictEqual(JSON.parse(JSON.stringify(costs)), row[6 + mi], where + ' costs');
    });
  });
  assert.strictEqual(digest.digest('hex'), BASELINE.textDigest, 'descriptions, carrying lines, materials or palette labels changed');
  t.diagnostic('1,728 creations × ' + BASELINE.modes.length + ' modes match the baseline');
});
