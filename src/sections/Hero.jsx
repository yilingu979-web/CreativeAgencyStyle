import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
    const containerRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);

    useEffect(() => {
        const title = titleRef.current;

        // Initial Reveal
        gsap.fromTo(title.children,
            { y: 100, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1.5,
                stagger: 0.1,
                ease: 'power4.out',
                delay: 2.5 // Wait for preloader
            }
        );

        gsap.fromTo(subtitleRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, delay: 3.5, ease: 'power2.out' }
        );

        // Parallax Effect
        gsap.to(containerRef.current, {
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: true
            },
            y: 200,
            ease: 'none'
        });

    }, []);

    return (
        <section ref={containerRef} className="relative h-screen flex flex-col justify-center items-center px-6 overflow-hidden bg-transparent">
            <div className="absolute top-6 left-6 md:top-10 md:left-10 z-20 font-display text-lg md:text-xl font-semibold tracking-[0.3em] text-secondary">
                扣寂
            </div>

            <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2000"
                    alt="Hero Background"
                    className="w-full h-full object-cover opacity-40 scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-transparent to-primary/80"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[120px] animate-pulse"></div>
            </div>

            <div className="relative z-10 w-full text-center mix-blend-difference">
                <h1 ref={titleRef} className="flex flex-wrap md:flex-nowrap items-baseline justify-center gap-x-[clamp(0.75rem,3vw,3rem)] gap-y-2 text-[clamp(2.4rem,12vw,9rem)] md:text-[clamp(4rem,8.5vw,9rem)] leading-none font-display font-bold text-secondary tracking-tight whitespace-nowrap">
                    <div className="overflow-hidden"><span className="inline-block">创造</span></div>
                    <div className="overflow-hidden"><span className="inline-block">影像</span></div>
                    <div className="overflow-hidden"><span className="inline-block text-transparent" style={{ WebkitTextStroke: '2px white' }}>未来</span></div>
                </h1>

                <div ref={subtitleRef} className="mt-8 md:mt-10 flex flex-col items-center gap-4">
                    <p className="text-base md:text-2xl leading-relaxed font-sans max-w-2xl text-secondary/80 text-center">
                        <span className="block">扣寂以 AI 重塑影像创作，</span>
                        <span className="block">让想象突破现实的边界。</span>
                    </p>
                    <div className="w-px h-24 bg-secondary/30 mt-10"></div>
                    <span className="text-xs tracking-[0.2em] font-sans text-secondary/50">SCROLL TO EXPLORE</span>
                </div>
            </div>
        </section>
    );
};

export default Hero;
