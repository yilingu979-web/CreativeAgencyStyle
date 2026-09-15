import test from 'node:test';
import assert from 'node:assert/strict';

import { createParticle, particleCountForDistance, shouldEnableParticleCursor } from './fluidCursorModel.js';

test('particle cursor respects reduced motion and touch input', () => {
  assert.equal(shouldEnableParticleCursor({ reducedMotion: true, isCoarsePointer: false }), false);
  assert.equal(shouldEnableParticleCursor({ reducedMotion: false, isCoarsePointer: true }), false);
  assert.equal(shouldEnableParticleCursor({ reducedMotion: false, isCoarsePointer: false }), true);
});

test('emission grows with movement but remains bounded', () => {
  assert.equal(particleCountForDistance(1), 10);
  assert.equal(particleCountForDistance(40), 36);
  assert.equal(particleCountForDistance(1000), 80);
});

test('particles use a compact monochrome grain profile', () => {
  const particle = createParticle({ x: 100, y: 200, dx: 20, dy: 0, random: () => 0.5 });
  assert.equal(particle.x, 100);
  assert.equal(particle.y, 200);
  assert.ok(particle.size <= 2.4);
  assert.ok(particle.maxLife >= 24 && particle.maxLife <= 58);
  assert.ok(particle.opacity >= 0.45 && particle.opacity <= 1);
});
