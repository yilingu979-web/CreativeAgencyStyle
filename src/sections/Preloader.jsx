import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
    buildIntroSequence,
    calculateGlyphMaskCanvas,
    INTRO_TEXTURE_INK_FLOOR,
    shouldUseChineseIntro,
} from './introSequence.js';
import './Preloader.css';

const loadImage = (src) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
});

const prepareCanvas = (canvas, width, height, pixelRatio) => {
    canvas.width = Math.ceil(width * pixelRatio);
    canvas.height = Math.ceil(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const context = canvas.getContext('2d');
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    return context;
};

const renderGlyphCanvases = (element, label, image) => {
    const textureCanvas = element.querySelector('.intro-preview__texture');
    const inkCanvas = element.querySelector('.intro-preview__ink');
    const styles = window.getComputedStyle(element);
    const fontSize = Number.parseFloat(styles.fontSize);
    const bounds = calculateGlyphMaskCanvas(fontSize);
    const font = `${styles.fontWeight} ${fontSize * bounds.fontScale}px ${styles.fontFamily}`;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 3);

    const maskCanvas = document.createElement('canvas');
    const maskContext = prepareCanvas(maskCanvas, bounds.width, bounds.height, pixelRatio);
    const textureContext = prepareCanvas(textureCanvas, bounds.width, bounds.height, pixelRatio);
    const inkContext = prepareCanvas(inkCanvas, bounds.width, bounds.height, pixelRatio);

    maskContext.font = font;
    maskContext.textAlign = 'center';
    maskContext.textBaseline = 'middle';
    maskContext.fillStyle = '#000';
    maskContext.fillText(label, bounds.textX, bounds.textY);

    const scale = Math.max(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight);
    const imageWidth = image.naturalWidth * scale;
    const imageHeight = image.naturalHeight * scale;
    textureContext.drawImage(
        image,
        (bounds.width - imageWidth) / 2,
        (bounds.height - imageHeight) / 2,
        imageWidth,
        imageHeight,
    );
    textureContext.globalCompositeOperation = 'destination-in';
    textureContext.drawImage(maskCanvas, 0, 0, bounds.width, bounds.height);

    inkContext.drawImage(maskCanvas, 0, 0, bounds.width, bounds.height);
    inkContext.globalCompositeOperation = 'source-in';
    inkContext.fillStyle = '#171717';
    inkContext.fillRect(0, 0, bounds.width, bounds.height);
};

const Preloader = () => {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const characterRefs = useRef([]);
    const [complete, setComplete] = useState(false);
    const reduceMotion = typeof window !== 'undefined'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isChineseIntro = typeof window !== 'undefined'
        && shouldUseChineseIntro(window.location.search, reduceMotion);

    useEffect(() => {
        if (isChineseIntro) {
            const characters = characterRefs.current.filter(Boolean);
            const inkLayers = characters.map((element) => element.querySelector('.intro-preview__ink'));
            const sequence = buildIntroSequence();
            let tl;
            let cancelled = false;

            Promise.all([
                document.fonts.ready,
                ...sequence.map((item) => loadImage(item.texture)),
            ]).then(([, ...images]) => {
                if (cancelled) return;
                characters.forEach((element, index) => {
                    renderGlyphCanvases(element, sequence[index].label, images[index]);
                });

                tl = gsap.timeline({ onComplete: () => setComplete(true) });
                gsap.set(characters, { opacity: 0, y: 20 });

                sequence.forEach((item, index) => {
                    tl.to(characters[index], {
                        opacity: 1, y: 0, duration: .62, ease: 'power3.out',
                    }, item.revealAt)
                        .to(inkLayers[index], {
                            opacity: INTRO_TEXTURE_INK_FLOOR,
                            duration: .82,
                            ease: 'power2.inOut',
                        }, item.revealAt + .18)
                        .to(characters[index], {
                            y: '116vh',
                            rotation: index % 2 === 0 ? -.8 : .65,
                            duration: 1.18,
                            ease: 'power3.in',
                        }, item.dropAt);
                });

                tl.to(containerRef.current, {
                    opacity: 0, duration: .64, ease: 'power2.inOut',
                }, 3.24);
            }).catch(() => {
                if (!cancelled) setComplete(true);
            });

            return () => {
                cancelled = true;
                if (tl) tl.kill();
            };
        }

        const tl = gsap.timeline({
            onComplete: () => setComplete(true)
        });

        const texts = ["VISION", "CREATIVITY", "EXPERIENCE"];

        // Text cycle animation
        texts.forEach((text) => {
            tl.to(textRef.current, {
                duration: 0.3,
                opacity: 1,
                text: text,
                ease: "power2.inOut",
                onStart: () => { if (textRef.current) textRef.current.innerText = text }
            })
                .to(textRef.current, {
                    duration: 0.3,
                    opacity: 0,
                    delay: 0.5,
                    ease: "power2.inOut"
                });
        });

        // Final reveal
        tl.to(containerRef.current, {
            duration: 1.5,
            y: '-100%',
            ease: 'power4.inOut',
            delay: 0.2
        });

        return () => tl.kill();
    }, [isChineseIntro, reduceMotion]);

    if (complete || reduceMotion) return null;

    if (isChineseIntro) {
        const words = buildIntroSequence();

        return (
            <div ref={containerRef} className="intro-preview" aria-label="洞见，创想，沉浸">
                <div className="intro-preview__frame">
                    <div className="intro-preview__words">
                        {words.map((item, index) => (
                            <span
                                className="intro-preview__char"
                                key={item.label}
                                ref={(node) => { characterRefs.current[index] = node; }}
                            >
                                <canvas className="intro-preview__texture" width="1" height="1" aria-hidden="true" />
                                <canvas className="intro-preview__ink" width="1" height="1" aria-hidden="true" />
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[10000] bg-primary flex items-center justify-center pointer-events-none"
        >
            <div className="overflow-hidden">
                <h1
                    ref={textRef}
                    className="text-4xl md:text-8xl font-display font-bold text-secondary opacity-0"
                >
                    LOADING
                </h1>
            </div>
        </div>
    );
};

export default Preloader;
