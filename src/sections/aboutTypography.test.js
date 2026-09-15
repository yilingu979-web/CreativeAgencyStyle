import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('the About section renders the confirmed preview copy with a semantic title break', async () => {
  const vite = await createServer({ server: { middlewareMode: true, hmr: false } });
  try {
    const { default: About } = await vite.ssrLoadModule('/src/sections/About.jsx');
    const markup = renderToStaticMarkup(createElement(About));
    const visibleText = markup.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

    assert.match(markup, /<span[^>]*>扣寂，<\/span><wbr\s*\/?><span[^>]*>于无声处寻音<\/span>/);
    assert.match(markup, /text-wrap:balance/);
    assert.match(visibleText, /课虚无以责有，叩寂寞而求音。我们在无声处扣问灵感/);
    assert.match(visibleText, /我们以电影思维重构数字叙事。核心团队来自北京电影学院、中央美术学院等院校/);
    assert.match(visibleText, /从为国际头部汽车与消费品牌打造 AIGC 广告，到创作 AI 真人短剧/);
    assert.match(visibleText, /让每一帧成为品牌与观众之间的回响。/);
    assert.match(markup, />MORE ABOUT US<\/button>/);
  } finally {
    await vite.close();
  }
});
