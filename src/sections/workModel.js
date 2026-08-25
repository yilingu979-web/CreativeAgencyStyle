const fullFilmBase = 'https://github.com/yilingu979-web/CreativeAgencyStyle/releases/download/selected-works-media-v1';

export const projects = [
  { id: 'wuling', title: '《五菱·万物同行》', cardTitle: '五菱·万物同行', category: '广告', preview: '/assets/works/previews/wuling-preview.mp4', full: `${fullFilmBase}/wuling-full.mp4` },
  { id: 'swim', title: '《SWIM》MV', cardTitle: 'SWIM', category: 'MV', preview: '/assets/works/previews/swim-preview.mp4', full: `${fullFilmBase}/swim-full.mp4` },
  { id: 'princess', title: '《帝国公主》', cardTitle: '帝国公主', category: '短剧', preview: '/assets/works/previews/princess-preview.mp4', full: `${fullFilmBase}/princess-full.mov`, portrait: true },
  { id: 'audi', title: '《奥迪·破夜而行》', cardTitle: '奥迪·破夜而行', category: '广告', preview: '/assets/works/previews/audi-preview.mp4', full: `${fullFilmBase}/audi-full.mp4` },
  { id: 'summer', title: '《夏日回响》MV', cardTitle: '夏日回响', category: 'MV', preview: '/assets/works/previews/summer-preview.mp4', full: `${fullFilmBase}/summer-full.mp4` },
];

export const shouldPlayPreview = ({ isVisible, hasOpenFilm }) => isVisible && !hasOpenFilm;
export const isDragGesture = (horizontalDistance) => Math.abs(horizontalDistance) >= 12;
