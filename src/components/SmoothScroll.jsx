import React, { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const SmoothScroll = ({ children }) => {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        const stopForFilm = () => lenis.stop();
        const resumeAfterFilm = () => lenis.start();
        window.addEventListener('work-lightbox:open', stopForFilm);
        window.addEventListener('work-lightbox:close', resumeAfterFilm);

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            window.removeEventListener('work-lightbox:open', stopForFilm);
            window.removeEventListener('work-lightbox:close', resumeAfterFilm);
            lenis.destroy();
        };
    }, []);

    return <div className="w-full min-h-screen">{children}</div>;
};

export default SmoothScroll;
