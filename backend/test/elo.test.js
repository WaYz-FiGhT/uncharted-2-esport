const { eloChange } = require('../utils/elo');
const assert = require('node:assert');
const { test } = require('node:test');

test('eloChange higher rated player wins', () => {
  const change = eloChange(1000, 1000, true);
  assert.strictEqual(change, 16);
});

test('eloChange higher rated player loses', () => {
  const change = eloChange(1200, 1000, false);
  assert.strictEqual(change, -24);
});

test('eloChange lower rated player wins', () => {
  const change = eloChange(1400, 1600, true);
  assert.strictEqual(change, 24);
});