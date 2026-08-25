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
      { title: '印尼五菱出海大片', preview: '/assets/works/previews/wuling-preview.mp4', full: 'https://github.com/yilingu979-web/CreativeAgencyStyle/releases/download/selected-works-media-v1/wuling-full.mp4' },
      { title: '《SWIM》MV', preview: '/assets/works/previews/swim-preview.mp4', full: 'https://github.com/yilingu979-web/CreativeAgencyStyle/releases/download/selected-works-media-v1/swim-full.mp4' },
      { title: '《帝国公主》', preview: '/assets/works/previews/princess-preview.mp4', full: 'https://github.com/yilingu979-web/CreativeAgencyStyle/releases/download/selected-works-media-v1/princess-full.mov' },
      { title: '《奥迪短片》', preview: '/assets/works/previews/audi-preview.mp4', full: 'https://github.com/yilingu979-web/CreativeAgencyStyle/releases/download/selected-works-media-v1/audi-full.mp4' },
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
