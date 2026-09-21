import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveContactEndpoint } from './contactEndpoint.js';

test('uses the deployed API endpoint when configured', () => {
  assert.equal(resolveContactEndpoint('https://api.koujikeji.com/contact'), 'https://api.koujikeji.com/contact');
});

test('keeps the local relative endpoint for preview environments', () => {
  assert.equal(resolveContactEndpoint(), '/api/contact');
  assert.equal(resolveContactEndpoint(''), '/api/contact');
});
