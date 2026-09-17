import test from 'node:test';
import assert from 'node:assert/strict';

import * as intro from './introSequence.js';

const { buildIntroSequence, shouldUseChineseIntro } = intro;

test('Chinese intro is the default opening without a preview URL parameter', () => {
  assert.equal(shouldUseChineseIntro(''), true);
  assert.equal(shouldUseChineseIntro('?build=cn-intro-preview'), true);
  assert.equal(shouldUseChineseIntro('?build=cloud-mural-final'), true);
});

test('intro reveals six individual characters before tightly staggered downward exits', () => {
  const sequence = buildIntroSequence();

  assert.deepEqual(sequence.map((item) => item.label), ['洞', '见', '创', '想', '沉', '浸']);
  assert.ok(sequence.every((item) => item.revealAt < item.dropAt));
  assert.ok(sequence.every((item, index) => index === 0 || item.dropAt > sequence[index - 1].dropAt));
  assert.ok(sequence.at(-1).dropAt - sequence[0].dropAt <= 0.5);
  assert.equal(new Set(sequence.map((item) => item.texture)).size, 6);
});

test('the complete intro stays compact enough to transition directly into the homepage', () => {
  const sequence = buildIntroSequence();

  assert.ok(sequence[0].revealAt <= 0.5);
  assert.ok(sequence.at(-1).dropAt <= 2.85);
  assert.ok(sequence.at(-1).completeAt <= 4.1);
});

test('reduced motion bypasses the decorative intro', () => {
  assert.equal(shouldUseChineseIntro('', true), false);
});

test('photo glyphs reserve a full four-sided canvas outside the complete glyph box', () => {
  assert.ok(intro.INTRO_GLYPH_METRICS, 'photo glyph metrics are missing');
  assert.ok(intro.INTRO_GLYPH_METRICS.lineHeightEm >= 1);
  assert.ok(intro.INTRO_GLYPH_METRICS.paddingBlockEm >= 0.08);
  assert.ok(intro.INTRO_GLYPH_METRICS.widthEm >= 1);
  assert.ok(intro.INTRO_GLYPH_METRICS.paddingInlineEm >= 0.08);
});

test('photo glyphs do not use an ink overlay to hide mask cropping', () => {
  assert.equal(intro.INTRO_TEXTURE_INK_FLOOR, 0);
});

test('glyph canvas bounds include every measured brush edge plus four-sided safety space', () => {
  assert.equal(typeof intro.calculateGlyphCanvasBounds, 'function');

  const bounds = intro.calculateGlyphCanvasBounds({
    actualBoundingBoxLeft: 9,
    actualBoundingBoxRight: 87,
    actualBoundingBoxAscent: 94,
    actualBoundingBoxDescent: 13,
  }, 12);

  assert.deepEqual(bounds, {
    width: 120,
    height: 131,
    textX: 21,
    baselineY: 106,
  });
});

test('shared glyph mask uses an oversized canvas centered around the complete character', () => {
  assert.equal(typeof intro.calculateGlyphMaskCanvas, 'function');
  assert.deepEqual(intro.calculateGlyphMaskCanvas(100), {
    width: 180,
    height: 180,
    textX: 90,
    textY: 90,
    fontScale: 1.22,
  });
});
