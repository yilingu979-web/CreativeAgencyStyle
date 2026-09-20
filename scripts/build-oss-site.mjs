import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

execFileSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--base=/'], { stdio: 'inherit' });
const html = readFileSync('dist/index.html', 'utf8');
if (html.includes('/CreativeAgencyStyle/') || html.includes('github.com/yilingu979-web/CreativeAgencyStyle/releases')) {
  throw new Error('Production build contains a development or GitHub Release URL.');
}
