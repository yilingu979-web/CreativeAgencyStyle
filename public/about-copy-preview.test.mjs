import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('./about-copy-preview.html', import.meta.url), 'utf8');
const visibleText = html.replace(/<[^>]+>/g, '');

test('second-page preview preserves the original white canvas and left-image-right-copy layout', () => {
  assert.match(html, /background:\s*#F5F5F5/i);
  assert.match(html, /\.page\s*\{[^}]*display:\s*flex;[^}]*align-items:\s*flex-start;/);
  assert.match(html, /\.visual\s*\{[^}]*margin-top:\s*calc\(10vh - 80px\)/);
  assert.match(html, /<img[^>]+kouji-imperial-bronze-portrait\.png/);
  assert.doesNotMatch(html, /我们重新|想象影像。/);
  assert.doesNotMatch(html, /<h1>叩寂<\/h1>/);
  assert.doesNotMatch(html, /class="number"/);
});

test('second-page preview shows the approved copy only in the right column', () => {
  assert.match(html, /<h2 class="copy-title"><span>叩寂，<\/span><wbr><span>于无声处寻音<\/span><\/h2>/);
  assert.match(html, /\.copy-title span\s*\{\s*white-space:\s*nowrap;/);
  assert.match(html, /\.intro\s*\{[^}]*text-wrap:\s*balance;/);
  assert.match(html, /\.body-copy\s*\{[^}]*text-wrap:\s*balance;/);
  assert.match(visibleText, /课虚无以责有，叩寂寞而求音。/);
  assert.match(visibleText, /核心团队来自北京电影学院、中央美术学院等院校/);
  assert.match(html, /从为国际头部汽车与消费品牌打造 AIGC 广告/);
  assert.match(visibleText, /让每一帧成为品牌与观众之间的回响。/);
  assert.match(html, /<button class="button" type="button">MORE ABOUT US<\/button>/);
  assert.doesNotMatch(html, /<br\s*\/?\s*>/i);
});
