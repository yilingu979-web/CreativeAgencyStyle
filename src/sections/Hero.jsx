
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Hero.css';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
    const containerRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);

    useEffect(() => {
        const title = titleRef.current;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reducedMotion) return undefined;

        const context = gsap.context(() => {
            gsap.fromTo(title.children,
                { y: 100, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.5,
                    stagger: 0.1,
                    ease: 'power4.out',
                    delay: 2.5
                }
            );

            gsap.fromTo(subtitleRef.current,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, delay: 3.5, ease: 'power2.out' }
            );

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
        });

        return () => context.revert();
    }, []);

    return (
        <section ref={containerRef} className="hero relative flex flex-col justify-center items-center overflow-hidden bg-primary">
            <div className="hero__brand absolute z-20 font-display font-medium tracking-[0.3em]">
                扣寂
            </div>

            <div className="hero__visual absolute inset-0 z-0 overflow-hidden">
                <img
                    src="/assets/kouji-cloud-mural.jpg"
                    alt="敦煌风格的朱红、石青与金色流云壁画"
                    className="hero__image"
                />
                <div className="hero__shade absolute inset-0" aria-hidden="true" />
            </div>

            <div className="hero__content relative z-10 w-full text-center">
                <h1 ref={titleRef} className="hero__title flex items-baseline justify-center leading-none font-display font-bold whitespace-nowrap">
                    <div className="overflow-hidden"><span className="inline-block">破界</span></div>
                    <span className="hero__dot" aria-hidden="true">·</span>
                    <div className="overflow-hidden"><span className="inline-block">生像</span></div>
                    <span className="hero__dot" aria-hidden="true">·</span>
                    <div className="overflow-hidden"><span className="hero__title-accent inline-block">启新</span></div>
                </h1>

                <div ref={subtitleRef} className="hero__intro flex flex-col items-center">
                    <p className="hero__copy font-sans text-center">
                        <span className="block">我们以AI驱动影像创意，融合最前沿技术与人性艺术，</span>
                        <span className="block">为品牌与文学打造超越常规的视觉表达，解锁全新叙事体验，</span>
                        <span className="block">共创极具传播力的影像作品。</span>
                    </p>
                </div>
            </div>

            <div className="hero__scroll absolute z-10 bottom-8 md:bottom-10 flex flex-col items-center">
                <span className="text-xs tracking-[0.32em] font-sans">SCROLL TO EXPLORE</span>
                <span className="hero__scroll-line" aria-hidden="true" />
            </div>
        </section>
    );
};

export default Hero;
