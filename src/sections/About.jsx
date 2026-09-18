import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const imageRef = useRef(null);

    const showSelectedWorks = () => {
        const selectedWorks = document.getElementById('selected-works');
        if (!selectedWorks) return;

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        selectedWorks.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
    };

    useEffect(() => {
        const textChildren = textRef.current.children;

        gsap.fromTo(textChildren,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: textRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        gsap.fromTo(imageRef.current,
            { scale: 1.2, y: -50 },
            {
                y: 50,
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            }
        );
    }, []);

    return (
        <section ref={containerRef} className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-secondary text-primary px-6 md:px-20 py-20 overflow-hidden">

            {/* Visual Side */}
            <div className="w-full aspect-[9/16] md:w-auto md:h-[80vh] relative overflow-hidden mb-10 md:mb-0 md:shrink-0">
                <div ref={imageRef} className="absolute inset-0 w-full h-full">
                    <img
                        src="/assets/kouji-imperial-bronze-portrait.png"
                        alt="帷幔下的宫殿远景与青铜双龙浮雕"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Text Side */}
            <div ref={textRef} className="w-full md:w-1/2 md:pl-20 flex flex-col gap-6">
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-neutral/60">Who We Are</h2>
                <h3 className="text-[30px] md:text-[36px] font-bold leading-[1.25] tracking-[0.02em] relative">
                    <span className="whitespace-nowrap">叩寂，</span><wbr /><span className="whitespace-nowrap">于无声处寻音</span>
                </h3>
                <p className="text-[17px] md:text-[18px] font-sans text-neutral/80 leading-[1.72] [text-wrap:balance]">
                    课虚无以责有，叩寂寞而<span className="whitespace-nowrap">求音。</span>我们在无声处扣问灵感，于<span className="whitespace-nowrap">喧嚣</span>中沉淀视觉；让东方美学与先锋艺术，在 AI 技术和<span className="whitespace-nowrap">影像</span>叙事的交汇中产生回响。
                </p>
                <p className="text-[15px] md:text-[16px] font-sans text-neutral/80 leading-[1.72] [text-wrap:balance]">
                    我们以电影思维重构数字叙事。核心团队来自北京电影学院、中央美术学院等院校，将对光影、空间与人性的理解注入创作，摆脱流水线式 AI 视觉，呈现有温度的影像美学。
                </p>
                <p className="text-[15px] md:text-[16px] font-sans text-neutral/80 leading-[1.72] [text-wrap:balance]">
                    从为国际头部汽车与消费品牌打造 AIGC 广告，到创作 AI 真人短剧、AI 3D 与动漫漫剧及实验性音乐影像，我们持续拓宽 AI 的表达边界，让每一帧成为品牌与观众之间的回响。
                </p>
                <div className="pt-8">
                    <button
                        type="button"
                        className="px-8 py-4 border border-primary/20 rounded-full hover:bg-primary hover:text-white transition-all duration-300 font-medium tracking-wide"
                        data-cursor="hover"
                        onClick={showSelectedWorks}
                    >
                        MORE ABOUT US
                    </button>
                </div>
            </div>
        </section>
    );
};

export default About;
