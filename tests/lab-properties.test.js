// Property-based tests for the lab and budget invariants, using only node:test
// and a small seeded generator (no dependencies). Each property draws random
// lab states, purchase modes and finder limits and checks a rule that must hold
// for all of them. On failure the message prints the seed and the case.
//
// Reproduce a run:  PROPERTY_SEED=12345 node --test tests/lab-properties.test.js
// More cases:       PROPERTY_RUNS=5000  node --test tests/lab-properties.test.js
'use strict';

var test = require('node:test');
var assert = require('node:assert');
var loadPage = require('./load-page').loadPage;

var SEED = Number(process.env.PROPERTY_SEED) || 20261031;
var RUNS = Number(process.env.PROPERTY_RUNS) || 1000;

// mulberry32: tiny, fast, deterministic
function rng(seed) {
  var a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    var t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pick(r, list) { return list[Math.floor(r() * list.length)]; }

// Generators
function genState(r, page) {
  return {
    base: pick(r, Object.keys(page.BASES)), twist: pick(r, Object.keys(page.TWISTS)),
    prop: pick(r, Object.keys(page.PROPS)), palette: pick(r, Object.keys(page.PALETTES)),
    mode: pick(r, Object.keys(page.BUDGET_MODES))
  };
}
function genLimits(r) {
  return {
    budget: pick(r, [null, null, 20, 25, 30, 40, 50, 60, 80, 100, 150, 250]),
    time: pick(r, [null, null, 10, 15, 20, 30, 45, 60, 90]),
    spook: pick(r, ['', '', 'gentle', 'eerie', 'terrifying'])
  };
}

// Runs `prop(case)` RUNS times (or `runs`) with a fresh generator per property.
function forAll(name, runs, gen, prop) {
  test('property: ' + name, function (t) {
    var page = loadPage();
    var r = rng(SEED + name.length * 7919);
    for (var i = 0; i < runs; i++) {
      var c = gen(r, page);
      try { prop(page, c); } catch (e) {
        e.message = '[seed ' + SEED + ', case ' + i + '] ' + JSON.stringify(c) + '\n' + e.message;
        throw e;
      }
    }
    t.diagnostic(runs + ' cases, seed ' + SEED);
  });
}
function plain(x) { return JSON.parse(JSON.stringify(x)); }

forAll('composition follows the documented rules', RUNS, genState, function (page, s) {
  var b = page.buildFor(s);
  var base = page.BASES[s.base], tw = page.TWISTS[s.twist], pr = page.PROPS[s.prop];
  assert.strictEqual(b.name, (tw.name ? tw.name + ' ' : '') + base.label);
  assert.strictEqual(b.spook, Math.max(1, Math.min(5, base.spook + tw.spook + pr.spook)));
  assert.ok(b.spook >= 1 && b.spook <= 5);
  assert.strictEqual(b.time, Math.max(5, base.time + tw.time));
  assert.strictEqual(b.budgetLabel, page.BUDGET_LABELS[Math.max(0, Math.min(2, base.budget + tw.budget))]);
  assert.ok(b.number >= 1 && b.number <= page.TOTAL_COMBOS);
});

forAll('each cost row is the stored range scaled and rounded; the total is the sum of the rows', RUNS, genState, function (page, s) {
  var b = page.buildFor(s);
  var mult = page.BUDGET_MODES[s.mode].multiplier;
  var tables = [page.BASES[s.base], page.TWISTS[s.twist], page.PROPS[s.prop], page.PALETTES[s.palette]];
  var sum = [0, 0];
  b.costs.forEach(function (row, i) {
    var want = [Math.round(tables[i].cost[0] * mult), Math.round(tables[i].cost[1] * mult)];
    assert.deepStrictEqual(plain(row.cost), want, row.part);
    assert.ok(Number.isInteger(row.cost[0]) && Number.isInteger(row.cost[1]), 'whole dollars');
    assert.ok(row.cost[0] >= 0 && row.cost[0] <= row.cost[1], 'min <= max');
    sum[0] += row.cost[0]; sum[1] += row.cost[1];
  });
  assert.deepStrictEqual(plain(b.costTotal), sum);
  if (s.twist === 'none') assert.deepStrictEqual(plain(b.costs[1].cost), [0, 0]);
});

forAll('Thrift <= Buy new <= Premium for every row and the total', RUNS, genState, function (page, s) {
  function costsIn(mode) {
    var b = page.buildFor(page.withMode(s, mode));
    return b.costs.map(function (x) { return x.cost; }).concat([b.costTotal]);
  }
  var th = costsIn('thrift'), nw = costsIn('new'), pr = costsIn('premium');
  for (var i = 0; i < th.length; i++) {
    for (var e = 0; e < 2; e++) assert.ok(th[i][e] <= nw[i][e] && nw[i][e] <= pr[i][e], 'row ' + i + ' end ' + e);
  }
});

forAll('the purchase mode changes only money, never the costume', RUNS, genState, function (page, s) {
  var a = page.buildFor(page.withMode(s, 'thrift')), b = page.buildFor(page.withMode(s, 'premium'));
  ['name', 'number', 'spook', 'time', 'budgetLabel', 'desc', 'carrying'].forEach(function (k) {
    assert.strictEqual(a[k], b[k], k);
  });
  assert.deepStrictEqual(plain(a.materials), plain(b.materials));
});

forAll('materials are de-duplicated and keep base, then twist, then prop order', RUNS, genState, function (page, s) {
  var b = page.buildFor(s);
  var lower = b.materials.map(function (m) { return m.toLowerCase(); });
  assert.strictEqual(new Set(lower).size, lower.length, 'duplicate material');
  var expected = [], seen = {};
  [page.BASES[s.base].materials, page.TWISTS[s.twist].materials, page.PROPS[s.prop].materials].forEach(function (list) {
    list.forEach(function (m) { if (!seen[m.toLowerCase()]) { seen[m.toLowerCase()] = 1; expected.push(m); } });
  });
  assert.deepStrictEqual(plain(b.materials), expected);
});

forAll('share hashes round-trip state and number', RUNS, genState, function (page, s) {
  var parsed = page.parseLabHash(page.labHash(s));
  assert.deepStrictEqual(plain(parsed), plain(s));
  assert.strictEqual(page.creationNumber(parsed), page.buildFor(s).number);
});

forAll('fmtRange prints "$a" or "$a–$b" and parses back', RUNS, function (r) {
  var a = Math.floor(r() * 400), b = a + (r() < 0.3 ? 0 : Math.floor(r() * 400));
  return [a, b];
}, function (page, range) {
  var text = page.fmtRange(range);
  var m = /^\$(\d+)(?:–\$(\d+))?$/.exec(text);
  assert.ok(m, text);
  assert.deepStrictEqual([Number(m[1]), m[2] === undefined ? Number(m[1]) : Number(m[2])], range);
  assert.strictEqual(m[2] === undefined, range[0] === range[1]);
});

// The finder scans all 1,728 creations per call, so use fewer cases here.
forAll('loosening any finder limit never lowers the fit count', Math.max(20, Math.round(RUNS / 20)), function (r) {
  return { limits: genLimits(r), mode: pick(r, ['thrift', 'new', 'premium']), loosen: pick(r, ['budget', 'time', 'spook']) };
}, function (page, c) {
  var looser = { budget: c.limits.budget, time: c.limits.time, spook: c.limits.spook };
  if (c.loosen === 'spook') looser.spook = '';
  else looser[c.loosen] = null;
  var tight = page.fittingCombos(c.mode, c.limits).length;
  var loose = page.fittingCombos(c.mode, looser).length;
  assert.ok(loose >= tight, 'tight ' + tight + ' > loose ' + loose);
});

forAll('a creation is in the finder result exactly when it meets every limit', Math.max(20, Math.round(RUNS / 20)), function (r, page) {
  return { limits: genLimits(r), state: genState(r, page) };
}, function (page, c) {
  var b = page.buildFor(c.state);
  var band = { '': [1, 5], gentle: [1, 2], eerie: [3, 3], terrifying: [4, 5] }[c.limits.spook];
  var meets = (c.limits.budget === null || b.costTotal[1] <= c.limits.budget) &&
    (c.limits.time === null || b.time <= c.limits.time) && b.spook >= band[0] && b.spook <= band[1];
  var listed = page.fittingCombos(c.state.mode, c.limits).some(function (x) {
    return page.creationNumber(x) === b.number;
  });
  assert.strictEqual(listed, meets);
  assert.strictEqual(page.fits(b, c.limits), meets);
});
