export const INTRO_GLYPH_METRICS = {
  lineHeightEm: 1.08,
  paddingBlockEm: 0.1,
  widthEm: 1,
  paddingInlineEm: 0.1,
};

export const INTRO_TEXTURE_INK_FLOOR = 0;

const INTRO_CHARACTERS = [
  ['洞', '/assets/intro/insight-haval.jpeg'],
  ['见', '/assets/intro/insight-city.jpg'],
  ['创', '/assets/intro/imagine-cloud-car.jpg'],
  ['想', '/assets/intro/imagine-child.jpg'],
  ['沉', '/assets/intro/immerse-city.jpg'],
  ['浸', '/assets/intro/immerse-family.jpg'],
];

export function shouldUseChineseIntro(search = '', reducedMotion = false) {
  if (reducedMotion) return false;
  return true;
}

export function buildIntroSequence() {
  return INTRO_CHARACTERS.map(([label, texture], index) => ({
    label,
    texture,
    revealAt: 0.32 + index * 0.075,
    dropAt: 2.35 + index * 0.085,
    completeAt: 3.72 + index * 0.055,
  }));
}

export function calculateGlyphCanvasBounds(measurement, padding) {
  return {
    width: measurement.actualBoundingBoxLeft + measurement.actualBoundingBoxRight + padding * 2,
    height: measurement.actualBoundingBoxAscent + measurement.actualBoundingBoxDescent + padding * 2,
    textX: measurement.actualBoundingBoxLeft + padding,
    baselineY: measurement.actualBoundingBoxAscent + padding,
  };
}

export function calculateGlyphMaskCanvas(fontSize) {
  return {
    width: fontSize * 1.8,
    height: fontSize * 1.8,
    textX: fontSize * 0.9,
    textY: fontSize * 0.9,
    fontScale: 1.22,
  };
}
