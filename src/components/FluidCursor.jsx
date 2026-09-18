import React, { useEffect, useRef } from 'react';
import { createParticle, particleCountForDistance, shouldEnableParticleCursor } from './fluidCursorModel';

const FluidCursor = () => {
    const canvasRef = useRef(null);
    const cursorDisabled = new URLSearchParams(window.location.search).get('cursor') !== 'particles';

    useEffect(() => {
        if (cursorDisabled) return undefined;
        const canvas = canvasRef.current;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
        if (!canvas || !shouldEnableParticleCursor({ reducedMotion, isCoarsePointer })) return undefined;

        const context = canvas.getContext('2d');
        if (!context) return undefined;
        const particles = [];
        let lastPoint = null;
        let frame;
        let pixelRatio = 1;

        const resize = () => {
            pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(window.innerWidth * pixelRatio);
            canvas.height = Math.round(window.innerHeight * pixelRatio);
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        };

        const onPointerMove = ({ clientX: x, clientY: y }) => {
            if (!lastPoint) {
                lastPoint = { x, y };
                return;
            }
            const dx = x - lastPoint.x;
            const dy = y - lastPoint.y;
            const distance = Math.hypot(dx, dy);
            if (distance < 2) return;

            const count = particleCountForDistance(distance);
            for (let index = 0; index < count; index += 1) {
                const progress = index / count;
                particles.push(createParticle({
                    x: lastPoint.x + dx * progress,
                    y: lastPoint.y + dy * progress,
                    dx,
                    dy,
                }));
            }
            if (particles.length > 1400) particles.splice(0, particles.length - 1400);
            lastPoint = { x, y };
        };

        const render = () => {
            context.clearRect(0, 0, canvas.width / pixelRatio, canvas.height / pixelRatio);
            for (let index = particles.length - 1; index >= 0; index -= 1) {
                const particle = particles[index];
                particle.life += 1;
                if (particle.life >= particle.maxLife) {
                    particles.splice(index, 1);
                    continue;
                }
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vx *= 0.985;
                particle.vy *= 0.985;
                const fade = 1 - particle.life / particle.maxLife;
                context.fillStyle = `rgba(255, 255, 255, ${particle.opacity * fade * fade})`;
                context.beginPath();
                context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                context.fill();
            }
            frame = window.requestAnimationFrame(render);
        };

        resize();
        render();
        window.addEventListener('resize', resize);
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerleave', onPointerLeave);

        function onPointerLeave() { lastPoint = null; }

        return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerleave', onPointerLeave);
        };
    }, [cursorDisabled]);

    return cursorDisabled ? null : <canvas ref={canvasRef} className="fluid-cursor" aria-hidden="true" />;
};

export default FluidCursor;
