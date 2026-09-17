import test from 'node:test';
import assert from 'node:assert/strict';

test('defines the three selectable production services with their verified case studies', async () => {
  const { productionServices } = await import('./productionServices.js');

  assert.deepEqual(
    productionServices.map(({ id, title, cases }) => [id, title, cases.map(({ title: caseTitle }) => caseTitle)]),
    [
      ['brand', 'AIGC 品牌广告', ['印尼五菱 Eksion 广告大片']],
      ['drama', 'AI 短剧与漫剧', ['I Married the Wall Street Most Wanted']],
      ['music', 'AIGC 音乐影像', ['天马行空主题 MV《夏日回响》', 'MVland 合作 MV《SWIM》']],
    ],
  );

  assert.equal(productionServices[1].cases[0].achievement, 'ReelShort 上线｜浏览量 600 万');
  assert.equal(productionServices[0].cases[0].images.length, 2);
  assert.equal(productionServices[1].cases[0].images.length, 2);
  assert.equal(productionServices[2].cases.length, 2);
});
