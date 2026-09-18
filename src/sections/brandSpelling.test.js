import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const sourceFiles = ['About.jsx', 'Hero.jsx', 'Footer.jsx'];

test('renders the brand name consistently as 叩寂', async () => {
  const sources = await Promise.all(sourceFiles.map((name) => readFile(new URL(`./${name}`, import.meta.url), 'utf8')));

  assert.doesNotMatch(sources.join('\n'), /扣寂/);
  assert.match(sources.join('\n'), /叩寂/);
});
