import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('renders fluid smoke above page backgrounds without blocking interaction or lightbox', async () => {
  const css = await readFile(new URL('../index.css', import.meta.url), 'utf8');
  const app = await readFile(new URL('../App.jsx', import.meta.url), 'utf8');
  const workCss = await readFile(new URL('../sections/Work.css', import.meta.url), 'utf8');

  const cursorRule = css.match(/\.fluid-cursor\s*\{([^}]+)\}/)?.[1] ?? '';
  const cursorZIndex = Number(cursorRule.match(/z-index:\s*(\d+)/)?.[1]);
  const lightboxZIndex = Number(workCss.match(/\.work-lightbox\s*\{[^}]*z-index:\s*(\d+)/)?.[1]);

  assert.ok(cursorZIndex > 0, 'fluid canvas should sit above opaque section backgrounds');
  assert.match(cursorRule, /pointer-events:\s*none/);
  assert.doesNotMatch(app, /<main className="[^"]*\bz-10\b/);
  assert.ok(lightboxZIndex > cursorZIndex, 'full-film lightbox should remain above the smoke');
});
