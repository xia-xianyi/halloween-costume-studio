// Costume finder and computed Halloween date (.kiro/specs/costume-finder).
// Run from the repo root: node --test tests/*.test.js
'use strict';

var test = require('node:test');
var assert = require('node:assert');
var loadPage = require('./load-page').loadPage;

var BUDGETS = [null, 25, 40, 60, 100, 150];
var TIMES = [null, 15, 30, 45, 60, 90];
var BANDS = { '': [1, 5], gentle: [1, 2], eerie: [3, 3], terrifying: [4, 5] };

// Independent re-implementation of the fit rule straight from the tables,
// so the test does not trust buildFor().
function bruteCount(page, modeKey, l) {
  var mult = page.BUDGET_MODES[modeKey].multiplier;
  var n = 0;
  Object.keys(page.BASES).forEach(function (bk) {
    var b = page.BASES[bk];
    Object.keys(page.TWISTS).forEach(function (tk) {
      var t = page.TWISTS[tk];
      Object.keys(page.PROPS).forEach(function (pk) {
        var p = page.PROPS[pk];
        Object.keys(page.PALETTES).forEach(function (ck) {
          var c = page.PALETTES[ck];
          var top = [b, t, p, c].reduce(function (s, x) { return s + Math.round(x.cost[1] * mult); }, 0);
          var time = Math.max(5, b.time + t.time);
          var spook = Math.max(1, Math.min(5, b.spook + t.spook + p.spook));
          var band = BANDS[l.spook || ''];
          if ((l.budget === null || top <= l.budget) && (l.time === null || time <= l.time) &&
              spook >= band[0] && spook <= band[1]) n++;
        });
      });
    });
  });
  return n;
}

function setSelect(page, id, value) {
  var s = page.document.getElementById(id);
  s.value = value;
  s.listeners.change.forEach(function (fn) { fn(); });
}
function click(node) { node.listeners.click.forEach(function (fn) { fn(); }); }

test('fit counts match an independent brute force for every limit combination and mode', function (t) {
  var page = loadPage();
  var checked = 0;
  Object.keys(page.BUDGET_MODES).forEach(function (modeKey) {
    BUDGETS.forEach(function (budget) {
      TIMES.forEach(function (time) {
        Object.keys(BANDS).forEach(function (spook) {
          var l = { budget: budget, time: time, spook: spook };
          var got = page.fittingCombos(modeKey, l).length;
          assert.strictEqual(got, bruteCount(page, modeKey, l), modeKey + ' ' + JSON.stringify(l));
          checked++;
        });
      });
    });
  });
  t.diagnostic(checked + ' limit combinations checked');
});

test('known anchors: Thrift $25/30 min = 54, Buy new $25 = 0, Buy new $60/30 min = 160', function () {
  var page = loadPage();
  assert.strictEqual(page.fittingCombos('thrift', { budget: 25, time: 30, spook: '' }).length, 54);
  assert.strictEqual(page.fittingCombos('new', { budget: 25, time: null, spook: '' }).length, 0);
  assert.strictEqual(page.fittingCombos('new', { budget: 60, time: 30, spook: '' }).length, 160);
  assert.strictEqual(page.fittingCombos('new', { budget: null, time: null, spook: '' }).length, 1728);
});

test('every combo the finder returns really fits', function () {
  var page = loadPage();
  var l = { budget: 40, time: 30, spook: 'gentle' };
  page.fittingCombos('thrift', l).forEach(function (c) {
    var b = page.buildFor(page.withMode(c, 'thrift'));
    assert.ok(b.costTotal[1] <= 40 && b.time <= 30 && b.spook <= 2, JSON.stringify(c));
  });
});

test('with no limit set the count says all 1,728 are in play and Summon is unchanged', function () {
  var page = loadPage();
  var count = page.document.getElementById('fit-count');
  var summon = page.document.getElementById('summon');
  assert.match(count.textContent, /^All 1,728 creations are in play\./);
  assert.strictEqual(summon.textContent, 'Summon a random costume');
  assert.strictEqual(summon.disabled, false);
});

test('Summon only draws creations that fit, and keeps the purchase mode', function () {
  var seed = 7;
  function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  var page = loadPage({ random: rand });
  setSelect(page, 'fit-budget', '40');
  setSelect(page, 'fit-time', '30');
  click(page.document.getElementById('lights')); // unrelated control, must not matter
  var summon = page.document.getElementById('summon');
  assert.strictEqual(summon.textContent, 'Summon one that fits');
  assert.match(page.document.getElementById('fit-count').textContent, /^30 of 1,728 creations fit in Buy new mode\.$/);
  for (var i = 0; i < 60; i++) {
    click(summon);
    var b = page.currentBuild();
    assert.strictEqual(page.labState.mode, 'new');
    assert.ok(b.costTotal[1] <= 40 && b.time <= 30, 'draw ' + i + ': ' + b.name + ' ' + JSON.stringify(b.costTotal) + ' ' + b.time);
  }
});

test('a dead end offers a one-tap switch to a mode where something fits', function () {
  var page = loadPage();
  setSelect(page, 'fit-budget', '25');
  var count = page.document.getElementById('fit-count');
  var fix = page.document.getElementById('fit-fix');
  var summon = page.document.getElementById('summon');
  assert.match(count.textContent, /^Nothing fits in Buy new mode/);
  assert.strictEqual(summon.disabled, true);
  assert.strictEqual(fix.children.length, 1, 'only Thrift can rescue a $25 budget');
  assert.strictEqual(fix.children[0].textContent, 'Switch to Thrift: 54 fit');
  click(fix.children[0]);
  assert.strictEqual(page.labState.mode, 'thrift');
  assert.strictEqual(summon.disabled, false);
  assert.match(count.textContent, /^54 of 1,728 creations fit in Thrift mode\.$/);
  assert.strictEqual(page.__replaced[page.__replaced.length - 1], page.labHash());
});

test('when nothing fits in any mode the panel says to loosen a limit and offers no switch', function () {
  var page = loadPage();
  // find selectable limits with zero fits in every mode (today: $25 + 15 min + Terrifying)
  var found = null;
  BUDGETS.forEach(function (budget) {
    TIMES.forEach(function (time) {
      Object.keys(BANDS).forEach(function (spook) {
        var l = { budget: budget, time: time, spook: spook };
        if (!found && (budget !== null || time !== null || spook) && Object.keys(page.BUDGET_MODES).every(function (m) {
          return bruteCount(page, m, l) === 0;
        })) found = l;
      });
    });
  });
  assert.ok(found, 'expected some selectable limits with no creations in any mode');
  if (found.budget !== null) setSelect(page, 'fit-budget', String(found.budget));
  if (found.time !== null) setSelect(page, 'fit-time', String(found.time));
  if (found.spook) setSelect(page, 'fit-spook', found.spook);
  assert.match(page.document.getElementById('fit-count').textContent, /^Nothing fits in any purchase mode/);
  assert.strictEqual(page.document.getElementById('fit-fix').children.length, 0);
});

test('nextHalloween rolls over on 1 November and fmtHalloween names the weekday', function () {
  var page = loadPage();
  function ymd(d) { return [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-'); }
  assert.strictEqual(ymd(page.nextHalloween(new Date(2026, 10, 27))), '2027-10-31');
  assert.strictEqual(ymd(page.nextHalloween(new Date(2027, 9, 30, 23, 59))), '2027-10-31');
  assert.strictEqual(ymd(page.nextHalloween(new Date(2027, 9, 31, 20, 0))), '2027-10-31');
  assert.strictEqual(ymd(page.nextHalloween(new Date(2027, 10, 1, 0, 0))), '2028-10-31');
  assert.strictEqual(ymd(page.nextHalloween(new Date(2028, 0, 5))), '2028-10-31');
  assert.strictEqual(page.fmtHalloween(new Date(2027, 9, 31)), 'Sunday 31 October 2027');
  assert.strictEqual(page.fmtHalloween(new Date(2028, 9, 31)), 'Tuesday 31 October 2028');
});

test('countdown text is computed: hero label and footer on an ordinary day', function () {
  var page = loadPage({ now: new Date(2026, 10, 27, 12, 0) });
  assert.match(page.document.getElementById('count-label').textContent, /Sunday 31 October 2027/);
  assert.strictEqual(page.document.getElementById('footer-date').textContent, 'Next Halloween: Sunday 31 October 2027.');
  assert.notStrictEqual(page.document.getElementById('tonight').hidden, false);
});

test('on Halloween the hero offers "Find a costume for tonight", which presets Thrift / $25 / 30 min', function () {
  var page = loadPage({ now: new Date(2027, 9, 31, 17, 0) });
  assert.strictEqual(page.document.getElementById('count-num').textContent, 'Tonight');
  var tonight = page.document.getElementById('tonight');
  assert.strictEqual(tonight.hidden, false);
  click(tonight);
  assert.strictEqual(page.labState.mode, 'thrift');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(page.fitLimits)), { budget: 25, time: 30, spook: '' });
  assert.match(page.document.getElementById('fit-count').textContent, /^54 of 1,728 creations fit in Thrift mode\.$/);
});
