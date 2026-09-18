import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('uses the approved portrait composite for the About visual', async () => {
  const aboutSource = await readFile(new URL('./About.jsx', import.meta.url), 'utf8');
  const expectedAsset = '/assets/kouji-imperial-bronze-portrait.png';

  assert.match(aboutSource, new RegExp(`src=["']${expectedAsset.replaceAll('/', '\\/')}["']`));
  assert.match(aboutSource, /alt="帷幔下的宫殿远景与青铜双龙浮雕"/);

  const image = await readFile(new URL(`../../public${expectedAsset}`, import.meta.url));
  assert.equal(image.subarray(1, 4).toString(), 'PNG');

  const width = image.readUInt32BE(16);
  const height = image.readUInt32BE(20);
  assert.ok(height > width, `expected a portrait image, got ${width}x${height}`);
});
