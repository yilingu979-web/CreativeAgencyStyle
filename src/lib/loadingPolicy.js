export const INTRO_DEADLINE_MS = 6000;
export const shouldShowIntro = (_seen, reducedMotion) => !reducedMotion;
export function loadPreviewOnce(video) {
  if (!video.getAttribute('src') && video.dataset.src) {
    video.src = video.dataset.src;
    video.load();
  }
}
