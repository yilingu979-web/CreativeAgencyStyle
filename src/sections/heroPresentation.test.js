import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

test('hero uses the approved mural, live headline, and three complete copy lines', async () => {
  const source = await readFile(new URL('./Hero.jsx', import.meta.url), 'utf8');
  assert.match(source, /kouji-cloud-mural\.jpg/);
  assert.match(source, /破界/);
  assert.match(source, /生像/);
  assert.match(source, /启新/);
  for (const text of [
    '我们以 AI 驱动影像创意，融合最前沿技术与人性艺术，',
    '为品牌与文学打造超越常规的视觉表达，解锁全新叙事体验，',
    '共创极具传播力的影像作品。',
  ]) assert.ok(source.includes(text));
  assert.doesNotMatch(source, /mix-blend-difference|unsplash|WebkitTextStroke/);
  assert.ok((await stat(new URL('../../public/assets/kouji-cloud-mural.jpg', import.meta.url))).size > 10000);
});

test('hero maintains small-screen layout, reduced motion, and scoped animation cleanup', async () => {
  const source = await readFile(new URL('./Hero.jsx', import.meta.url), 'utf8');
  const css = await readFile(new URL('./Hero.css', import.meta.url), 'utf8');
  assert.match(source, /prefers-reduced-motion/);
  assert.match(source, /revert\(/);
  assert.match(css, /100svh/);
  assert.match(css, /max-width: 600px/);
  assert.match(css, /object-fit: cover/);
});
