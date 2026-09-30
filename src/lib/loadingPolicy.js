export const INTRO_DEADLINE_MS = 1200;
export const shouldShowIntro = (seen, reducedMotion) => !seen && !reducedMotion;
export function loadPreviewOnce(video) {
  if (!video.getAttribute('src') && video.dataset.src) {
    video.src = video.dataset.src;
    video.load();
  }
}
