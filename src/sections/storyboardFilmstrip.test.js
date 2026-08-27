import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('renders the approved three moving film tracks with a real frame asset', async () => {
  const [component, styles] = await Promise.all([
    readFile(new URL('./Experimental.jsx', import.meta.url), 'utf8'),
    readFile(new URL('./Experimental.css', import.meta.url), 'utf8'),
  ]);

  assert.match(component, /cinematic-film-tracks-v1/);
  assert.match(component, /const tracks = \[/);
  assert.doesNotMatch(component, /MOVE · DISCOVER · ENTER THE FRAME/);
  assert.match(styles, /\.storyboard-track__set::after/);
  assert.match(styles, /filmstrip-frame\.png/);
  assert.match(styles, /pointer-events\s*:\s*none/);
});
