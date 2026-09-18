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

test('keeps the film rails outside the photographs in the selected flat composition', async () => {
  const styles = await readFile(new URL('./Experimental.css', import.meta.url), 'utf8');

  assert.match(styles, /\.storyboard-track__set::after\s*\{[^}]*inset:\s*clamp\(-\.75rem,-1vh,-\.45rem\)\s+0/);
  assert.match(styles, /\.storyboard-track\s*\{[^}]*overflow:hidden/);
  assert.doesNotMatch(styles, /film-breathe|--film-tilt|rotate\(var\(--film-tilt\)\)/);
});

test('keeps the title legible with a narrower softer central dark field', async () => {
  const styles = await readFile(new URL('./Experimental.css', import.meta.url), 'utf8');
  const titleRule = styles.match(/\.storyboard-experience__title\s*\{([^}]+)\}/)?.[1] ?? '';

  assert.match(titleRule, /width:\s*min\(40rem,54vw\)/);
  assert.match(titleRule, /background:\s*rgba\(8,8,8,\.9\)/);
  assert.match(titleRule, /box-shadow:\s*0 0 2\.25rem 1rem rgba\(8,8,8,\.94\)/);
});

test('shows a fixed behind-the-frames chapter label without a numeric prefix', async () => {
  const [component, styles] = await Promise.all([
    readFile(new URL('./Experimental.jsx', import.meta.url), 'utf8'),
    readFile(new URL('./Experimental.css', import.meta.url), 'utf8'),
  ]);

  assert.match(component, /storyboard-experience__chapter/);
  assert.match(component, />BEHIND THE FRAMES</);
  assert.match(component, />分镜花絮</);
  assert.doesNotMatch(component, /04 \/ BEHIND THE FRAMES/);
  assert.match(styles, /\.storyboard-experience__chapter\s*\{[^}]*position:absolute[^}]*left:clamp\(1\.5rem,7vw,6\.5rem\)/);
  assert.match(styles, /\.storyboard-experience__field\s*\{[^}]*gap:clamp\(4\.5rem,8\.5vh,6rem\)/);
});
