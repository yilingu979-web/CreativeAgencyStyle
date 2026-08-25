import test from 'node:test';
import assert from 'node:assert/strict';

import { createFluidConfig, pointerEventToMouseInit, shouldEnableFluidCursor } from './fluidCursorModel.js';

test('desktop profile matches the approved smoky colorful interaction', () => {
  const config = createFluidConfig({ isMobile: false });

  assert.equal(config.TRIGGER, 'hover');
  assert.equal(config.TRANSPARENT, true);
  assert.equal(config.COLORFUL, true);
  assert.equal(config.SIM_RESOLUTION, 128);
  assert.equal(config.DYE_RESOLUTION, 1024);
  assert.equal(config.DENSITY_DISSIPATION, 3.5);
  assert.equal(config.SPLAT_FORCE, 6500);
});

test('mobile profile lowers GPU cost without changing the interaction style', () => {
  const config = createFluidConfig({ isMobile: true });

  assert.equal(config.TRIGGER, 'hover');
  assert.equal(config.TRANSPARENT, true);
  assert.equal(config.COLORFUL, true);
  assert.equal(config.SIM_RESOLUTION, 64);
  assert.equal(config.DYE_RESOLUTION, 512);
  assert.equal(config.SHADING, false);
});

test('fluid cursor is disabled for reduced motion or missing WebGL', () => {
  assert.equal(shouldEnableFluidCursor({ reducedMotion: true, hasWebGL: true }), false);
  assert.equal(shouldEnableFluidCursor({ reducedMotion: false, hasWebGL: false }), false);
  assert.equal(shouldEnableFluidCursor({ reducedMotion: false, hasWebGL: true }), true);
});

test('pointer movement is forwarded without taking ownership of scrolling or clicks', () => {
  assert.deepEqual(pointerEventToMouseInit({ clientX: 120, clientY: 340 }), {
    clientX: 120,
    clientY: 340,
  });
});
