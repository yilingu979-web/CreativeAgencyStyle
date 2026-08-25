import React, { useEffect, useRef } from 'react';
import { createFluidConfig, pointerEventToMouseInit, shouldEnableFluidCursor } from './fluidCursorModel';

const supportsWebGL = () => {
    const probe = document.createElement('canvas');
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
};

const FluidCursor = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!canvas || canvas.dataset.fluidInitialized || !shouldEnableFluidCursor({ reducedMotion, hasWebGL: supportsWebGL() })) return;

        canvas.dataset.fluidInitialized = 'true';
        const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;

        import('webgl-fluid').then(({ default: WebGLFluid }) => {
            WebGLFluid(canvas, createFluidConfig({ isMobile }));
            window.addEventListener('pointermove', (event) => {
                canvas.dispatchEvent(new MouseEvent('mousemove', pointerEventToMouseInit(event)));
            }, { passive: true });
        }).catch(() => {
            canvas.hidden = true;
        });
    }, []);

    return <canvas ref={canvasRef} className="fluid-cursor" aria-hidden="true" />;
};

export default FluidCursor;
