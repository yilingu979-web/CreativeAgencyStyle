import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readSection = (name) => readFile(new URL(`./${name}`, import.meta.url), 'utf8');

test('MORE ABOUT US targets Selected Works with native keyboard activation and reduced-motion support', async () => {
  const [about, work] = await Promise.all([readSection('About.jsx'), readSection('Work.jsx')]);

  assert.match(about, /type="button"/);
  assert.match(about, /getElementById\(['"]selected-works['"]\)/);
  assert.match(about, /prefers-reduced-motion:\s*reduce/);
  assert.match(about, /scrollIntoView\(\{\s*behavior:\s*reducedMotion\.matches\s*\?\s*['"]auto['"]\s*:\s*['"]smooth['"]/);
  assert.match(work, /<section\s+id="selected-works"/);
});

test('card clicks keep their target until a deliberate drag begins', async () => {
  const work = await readSection('Work.jsx');

  const startDrag = work.match(/const startDrag[\s\S]*?const moveDrag/)?.[0] ?? '';
  const moveDrag = work.match(/const moveDrag[\s\S]*?const endDrag/)?.[0] ?? '';

  assert.doesNotMatch(startDrag, /setPointerCapture/);
  assert.match(moveDrag, /isDragGesture\(distance,\s*verticalDistance\)[\s\S]*setPointerCapture/);
  assert.match(work, /onPointerUp=\{\(event\)\s*=>\s*activatePointer\(event,\s*project\)\}/);
  assert.match(work, /event\.detail\s*===\s*0/);
});

test('full-film player is top-level, audible, controlled without download controls, and protected from backdrop clicks', async () => {
  const work = await readSection('Work.jsx');

  assert.match(work, /createPortal/);
  assert.match(work, /fullVideoRef\.current\.muted\s*=\s*false/);
  assert.match(work, /controls/);
  assert.match(work, /controlsList="nodownload noremoteplayback"/);
  assert.match(work, /disablePictureInPicture/);
  assert.match(work, /onContextMenu=\{\(event\) => event\.preventDefault\(\)\}/);
  assert.match(work, /event\.target\s*===\s*event\.currentTarget/);
  assert.match(work, /event\.key\s*===\s*['"]Escape['"]/);
  assert.match(work, /appRoot\.inert\s*=\s*true/);
  assert.match(work, /event\.key\s*!==\s*['"]Tab['"]/);
  assert.match(work, /work-lightbox:open/);
  assert.match(work, /work-lightbox:close/);
});

test('keeps the production services beneath the works as a single-select case-study accordion', async () => {
  const work = await readSection('Work.jsx');

  assert.doesNotMatch(work, />Selected Works</);
  assert.match(work, /AI 影像制作服务/);
  assert.match(work, /productionServices/);
  assert.match(work, /setActiveService/);
  assert.match(work, /aria-expanded=\{activeService === service\.id\}/);
  assert.match(work, /service-detail/);
  assert.match(work, /selected-works--service-open/);
});

test('opens supplied service frames in an accessible image lightbox', async () => {
  const work = await readSection('Work.jsx');

  assert.match(work, /setActiveImage/);
  assert.match(work, /查看.*大图/);
  assert.match(work, /className="work-lightbox__image"/);
  assert.match(work, /alt=\{activeImage\.alt\}/);
});
