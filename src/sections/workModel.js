const fullFilmBase = 'https://github.com/yilingu979-web/CreativeAgencyStyle/releases/download/selected-works-media-v1';

export const projects = [
  { id: 'wuling', title: '印尼五菱出海大片', preview: '/assets/works/previews/wuling-preview.mp4', full: `${fullFilmBase}/wuling-full.mp4` },
  { id: 'swim', title: '《SWIM》MV', preview: '/assets/works/previews/swim-preview.mp4', full: `${fullFilmBase}/swim-full.mp4` },
  { id: 'princess', title: '《帝国公主》', preview: '/assets/works/previews/princess-preview.mp4', full: `${fullFilmBase}/princess-full.mov`, portrait: true },
  { id: 'audi', title: '《奥迪短片》', preview: '/assets/works/previews/audi-preview.mp4', full: `${fullFilmBase}/audi-full.mp4` },
  { id: 'summer', title: '《夏日回响》MV', preview: '/assets/works/previews/summer-preview.mp4', full: `${fullFilmBase}/summer-full.mp4` },
];

export const shouldPlayPreview = ({ isVisible, hasOpenFilm }) => isVisible && !hasOpenFilm;
