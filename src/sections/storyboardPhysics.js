export const getLoopOffset = (distance, loopWidth, direction = 1) => {
  if (!loopWidth) return 0;
  const progress = ((distance % loopWidth) + loopWidth) % loopWidth;
  return direction >= 0 ? -progress : progress - loopWidth;
};

export const getPointerParallax = (pointerX, pointerY, width, height, amount = 10) => {
  if (!width || !height) return { x: 0, y: 0 };
  const clamp = (value) => Math.max(-1, Math.min(1, value));
  return {
    x: clamp((pointerX / width - 0.5) * 2) * amount,
    y: clamp((pointerY / height - 0.5) * 2) * amount,
  };
};

export const getPointerRepulsion = (body, pointer, radius, strength) => {
  const dx = body.x - pointer.x;
  const dy = body.y - pointer.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0 || distance >= radius) return { x: 0, y: 0 };

  const force = (1 - distance / radius) * strength;
  return {
    x: (dx / distance) * force,
    y: (dy / distance) * force,
  };
};

export const stepAnchoredBody = (body, anchor, force = { x: 0, y: 0 }, options = {}) => {
  const spring = options.spring ?? 0.035;
  const damping = options.damping ?? 0.9;
  const maxOffset = options.maxOffset ?? 28;
  let vx = (body.vx + (anchor.x - body.x) * spring + force.x) * damping;
  let vy = (body.vy + (anchor.y - body.y) * spring + force.y) * damping;
  let x = body.x + vx;
  let y = body.y + vy;

  const offsetX = x - anchor.x;
  const offsetY = y - anchor.y;
  if (Math.abs(offsetX) > maxOffset) {
    x = anchor.x + Math.sign(offsetX) * maxOffset;
    vx = 0;
  }
  if (Math.abs(offsetY) > maxOffset) {
    y = anchor.y + Math.sign(offsetY) * maxOffset;
    vy = 0;
  }

  return { x, y, vx, vy };
};
