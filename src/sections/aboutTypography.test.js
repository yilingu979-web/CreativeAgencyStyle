import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('keeps the final Chinese word together and aligns the About copy cleanly', async () => {
  const aboutSource = await readFile(new URL('./About.jsx', import.meta.url), 'utf8');

  assert.match(aboutSource, /\[text-align:justify\]/);
  assert.match(aboutSource, /\[text-justify:inter-character\]/);
  assert.match(aboutSource, /<span className="whitespace-nowrap">体验<\/span>/);
});
