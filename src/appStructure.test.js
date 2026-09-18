import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('renders the original fourth page between selected works and the footer', async () => {
  const appSource = await readFile(new URL('./App.jsx', import.meta.url), 'utf8');

  assert.match(appSource, /import Experimental from ['"]\.\/sections\/Experimental['"]/);

  const workPosition = appSource.indexOf('<Work />');
  const experimentalPosition = appSource.indexOf('<Experimental />');
  const footerPosition = appSource.indexOf('<Footer />');

  assert.ok(workPosition >= 0, 'Selected Works page should be rendered');
  assert.ok(experimentalPosition > workPosition, 'Fourth page should follow Selected Works');
  assert.ok(footerPosition > experimentalPosition, 'Footer should follow the fourth page');
});
