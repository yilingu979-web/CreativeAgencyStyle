import test from 'node:test';
import assert from 'node:assert/strict';

async function loadModel() {
  try {
    return await import('./workModel.js');
  } catch (error) {
    assert.fail(`Selected Works model is unavailable: ${error.message}`);
  }
}

test('maps the five approved works to their matching preview and full videos in order', async () => {
  const { projects } = await loadModel();

  assert.deepEqual(
    projects.map(({ title, preview, full }) => ({ title, preview, full })),
    [
      { title: '《五菱·万物同行》', preview: '/assets/works/previews/wuling-preview.mp4', full: 'https://github.com/yilingu979-web/CreativeAgencyStyle/releases/download/selected-works-media-v1/wuling-full.mp4' },
      { title: '《SWIM》MV', preview: '/assets/works/previews/swim-preview.mp4', full: 'https://github.com/yilingu979-web/CreativeAgencyStyle/releases/download/selected-works-media-v1/swim-full.mp4' },
      { title: '《帝国公主》', preview: '/assets/works/previews/princess-preview.mp4', full: 'https://github.com/yilingu979-web/CreativeAgencyStyle/releases/download/selected-works-media-v1/princess-full.mov' },
      { title: '《奥迪·破夜而行》', preview: '/assets/works/previews/audi-preview.mp4', full: 'https://github.com/yilingu979-web/CreativeAgencyStyle/releases/download/selected-works-media-v1/audi-full.mp4' },
      { title: '《夏日回响》MV', preview: '/assets/works/previews/summer-preview.mp4', full: 'https://github.com/yilingu979-web/CreativeAgencyStyle/releases/download/selected-works-media-v1/summer-full.mp4' },
    ],
  );
});

test('allows muted previews only while visible and no full film is open', async () => {
  const { shouldPlayPreview } = await loadModel();

  assert.equal(shouldPlayPreview({ isVisible: true, hasOpenFilm: false }), true);
  assert.equal(shouldPlayPreview({ isVisible: false, hasOpenFilm: false }), false);
  assert.equal(shouldPlayPreview({ isVisible: true, hasOpenFilm: true }), false);
});

test('keeps card titles and production types paired with the approved work order', async () => {
  const { projects } = await loadModel();

  assert.deepEqual(projects.map(({ cardTitle, category }) => [cardTitle, category]), [
    ['五菱·万物同行', '广告'],
    ['SWIM', 'MV'],
    ['帝国公主', '短剧'],
    ['奥迪·破夜而行', '广告'],
    ['夏日回响', 'MV'],
  ]);
});

test('treats slight pointer movement as a click and intentional horizontal movement as drag', async () => {
  const { isDragGesture } = await loadModel();

  assert.equal(isDragGesture(0, 0), false);
  assert.equal(isDragGesture(7, 2), false);
  assert.equal(isDragGesture(-7, 2), false);
  assert.equal(isDragGesture(13, 2), true);
  assert.equal(isDragGesture(-13, 2), true);
  assert.equal(isDragGesture(13, 40), false);
  assert.equal(isDragGesture(40, 13), true);
});
