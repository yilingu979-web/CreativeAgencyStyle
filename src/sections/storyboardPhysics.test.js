import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getLoopOffset,
  getPointerParallax,
  getPointerRepulsion,
  stepAnchoredBody,
} from './storyboardPhysics.js';

test('film track offset loops seamlessly in either direction', () => {
  assert.equal(getLoopOffset(25, 100, 1), -25);
  assert.equal(getLoopOffset(125, 100, 1), -25);
  assert.equal(getLoopOffset(25, 100, -1), -75);
});

test('pointer parallax stays subtle and centered', () => {
  assert.deepEqual(getPointerParallax(500, 250, 1000, 500, 10), { x: 0, y: 0 });
  assert.deepEqual(getPointerParallax(1000, 500, 1000, 500, 10), { x: 10, y: 10 });
  assert.deepEqual(getPointerParallax(-500, -250, 1000, 500, 10), { x: -10, y: -10 });
});

test('pointer repulsion fades with distance and is zero outside its radius', () => {
  assert.deepEqual(getPointerRepulsion({ x: 50, y: 0 }, { x: 0, y: 0 }, 100, 10), { x: 5, y: 0 });
  assert.deepEqual(getPointerRepulsion({ x: 100, y: 0 }, { x: 0, y: 0 }, 100, 10), { x: 0, y: 0 });
  assert.deepEqual(getPointerRepulsion({ x: 0, y: 0 }, { x: 0, y: 0 }, 100, 10), { x: 0, y: 0 });
});

test('storyboard bodies ease back toward their designed anchor', () => {
  assert.deepEqual(
    stepAnchoredBody(
      { x: 110, y: 95, vx: 0, vy: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 0 },
      { spring: 0.1, damping: 0.8, maxOffset: 24 },
    ),
    { x: 109.2, y: 95.4, vx: -0.8, vy: 0.4 },
  );
});

test('storyboard bodies cannot be pushed beyond their composition range', () => {
  assert.deepEqual(
    stepAnchoredBody(
      { x: 120, y: 100, vx: 8, vy: 0 },
      { x: 100, y: 100 },
      { x: 10, y: 0 },
      { spring: 0, damping: 1, maxOffset: 24 },
    ),
    { x: 124, y: 100, vx: 0, vy: 0 },
  );
});
