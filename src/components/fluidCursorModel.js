export const shouldEnableParticleCursor = ({ reducedMotion, isCoarsePointer }) => !reducedMotion && !isCoarsePointer;

export const particleCountForDistance = (distance) => Math.min(80, Math.max(10, Math.round(distance * 0.9)));

export const createParticle = ({ x, y, dx, dy, random = Math.random }) => {
  const speed = Math.hypot(dx, dy) || 1;
  const tangentX = dx / speed;
  const tangentY = dy / speed;
  const normalX = -tangentY;
  const normalY = tangentX;
  const spread = (random() - 0.5) * 44;
  const drift = 0.8 + random() * 2.8;

  return {
    x: x + normalX * spread,
    y: y + normalY * spread,
    vx: tangentX * (1.2 + random() * 2.5) + normalX * drift * (random() - 0.5),
    vy: tangentY * (1.2 + random() * 2.5) + normalY * drift * (random() - 0.5),
    size: 0.6 + random() * 1.8,
    life: 0,
    maxLife: 24 + random() * 34,
    opacity: 0.45 + random() * 0.55,
  };
};
