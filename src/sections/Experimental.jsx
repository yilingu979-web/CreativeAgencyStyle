// @refresh reset
import React, { useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { getLoopOffset, getPointerParallax } from './storyboardPhysics';
import './Experimental.css';

const STORYBOARD_LAYOUT_VERSION = 'cinematic-film-tracks-v1';
const storyboards = [
    ['01-haval.jpeg', '光影中的汽车'], ['10-door.png', '神秘的木门'], ['07-knight.png', '中世纪骑士与战马'], ['04-horn.png', '手工制作的号角'], ['05-bride.jpeg', '教堂中的新娘'], ['09-gallery.png', '雨夜画廊广告'], ['20-rhino-family.jpeg', '夕阳下的犀牛母子'],
    ['02-cloud-car.jpg', '云朵包围的汽车'], ['03-apothecary.png', '中世纪药剂师的房间'], ['08-palace.jpeg', '金色宫殿'], ['06-courtroom.png', '法庭中的两位女性'], ['11-office.jpeg', '落日中的办公室'], ['12-traffic-light.png', '雨夜街头的红灯'],
    ['13-elevator.jpg', '拥挤的电梯'], ['14-house.jpeg', '夕阳下的住宅'], ['15-family-car.png', '汽车旁的一家人'], ['17-city-buildings.png', '夜晚的城市建筑'], ['19-sleeping-child.png', '车内熟睡的女孩'], ['16-police.png', '雨中的纽约街头'], ['18-cafe-car.png', '街边咖啡馆与汽车'],
].map(([file, alt], index) => ({ id: `storyboard-${index + 1}`, src: `/assets/storyboards/${file}`, alt }));
const tracks = [
    { items: storyboards.slice(0, 7), direction: 1, speed: 18 },
    { items: storyboards.slice(7, 13), direction: -1, speed: 14 },
    { items: storyboards.slice(13), direction: 1, speed: 16 },
];

const Experimental = () => {
    const sectionRef = useRef(null);
    const trackRefs = useRef([]);
    const motionRef = useRef(tracks.map(() => ({ distance: 0, factor: 1, target: 1 })));
    const [selectedIndex, setSelectedIndex] = useState(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return undefined;
        const observer = new IntersectionObserver(([entry]) => document.body.classList.toggle('storyboard-active', entry.isIntersecting && entry.intersectionRatio > .35), { threshold: [0, .35, .7] });
        observer.observe(section);
        let frame;
        let previous = performance.now();
        const animate = (now) => {
            const elapsed = Math.min((now - previous) / 1000, .05);
            previous = now;
            motionRef.current.forEach((motion, index) => {
                const track = trackRefs.current[index];
                if (!track || selectedIndex !== null) return;
                const loopWidth = track.firstElementChild?.getBoundingClientRect().width || 0;
                motion.factor += (motion.target - motion.factor) * Math.min(1, elapsed * 3.2);
                motion.distance += tracks[index].speed * motion.factor * elapsed;
                track.style.transform = `translate3d(${getLoopOffset(motion.distance, loopWidth, tracks[index].direction)}px,0,0)`;
            });
            frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        const handlePointerMove = (event) => {
            const rect = section.getBoundingClientRect();
            const parallax = getPointerParallax(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height, 9);
            section.style.setProperty('--parallax-x', `${parallax.x}px`);
            section.style.setProperty('--parallax-y', `${parallax.y}px`);
        };
        const handlePointerLeave = () => {
            section.style.setProperty('--parallax-x', '0px');
            section.style.setProperty('--parallax-y', '0px');
            motionRef.current.forEach((motion) => { motion.target = 1; });
        };
        section.addEventListener('pointermove', handlePointerMove, { passive: true });
        section.addEventListener('pointerleave', handlePointerLeave, { passive: true });
        return () => {
            observer.disconnect();
            document.body.classList.remove('storyboard-active');
            section.removeEventListener('pointermove', handlePointerMove);
            section.removeEventListener('pointerleave', handlePointerLeave);
            cancelAnimationFrame(frame);
        };
    }, [selectedIndex]);

    useEffect(() => {
        if (selectedIndex === null) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setSelectedIndex(null);
            if (event.key === 'ArrowLeft') setSelectedIndex((index) => (index - 1 + storyboards.length) % storyboards.length);
            if (event.key === 'ArrowRight') setSelectedIndex((index) => (index + 1) % storyboards.length);
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handleKeyDown); };
    }, [selectedIndex]);

    const selected = selectedIndex === null ? null : storyboards[selectedIndex];
    const openStoryboard = (item) => setSelectedIndex(storyboards.findIndex((candidate) => candidate.id === item.id));
    return <section ref={sectionRef} className="storyboard-experience" aria-labelledby="storyboard-title" data-layout-version={STORYBOARD_LAYOUT_VERSION}>
        <p className="storyboard-experience__eyebrow">AI CINEMATIC STORYBOARDS</p>
        <div className="storyboard-experience__field">
            {tracks.map((track, trackIndex) => <div className={`storyboard-track storyboard-track--${trackIndex + 1}`} key={`track-${trackIndex + 1}`}>
                <div ref={(node) => { trackRefs.current[trackIndex] = node; }} className="storyboard-track__motion">
                    {[0, 1].map((copyIndex) => <div className="storyboard-track__set" key={`set-${copyIndex}`} aria-hidden={copyIndex === 1}>
                        {track.items.map((item) => <button type="button" className="storyboard-card" key={`${copyIndex}-${item.id}`} onPointerEnter={() => { motionRef.current[trackIndex].target = .35; }} onPointerLeave={() => { motionRef.current[trackIndex].target = 1; }} onFocus={() => { motionRef.current[trackIndex].target = .35; }} onBlur={() => { motionRef.current[trackIndex].target = 1; }} onClick={() => openStoryboard(item)} aria-label={`放大查看：${item.alt}`} tabIndex={copyIndex === 1 ? -1 : 0} data-cursor="text" data-cursor-text="VIEW"><img src={item.src} alt={copyIndex === 0 ? item.alt : ''} draggable="false" /></button>)}
                    </div>)}
                </div>
            </div>)}
        </div>
        <div className="storyboard-experience__title"><h2 id="storyboard-title">让一切<span>可能</span>发生</h2><p>MAKE EVERY POSSIBILITY REAL</p></div>
        {selected && <div className="storyboard-lightbox" role="dialog" aria-modal="true" aria-label={selected.alt} onPointerDown={(event) => { if (event.target === event.currentTarget) setSelectedIndex(null); }}>
            <button type="button" className="storyboard-lightbox__close" onClick={() => setSelectedIndex(null)} aria-label="关闭大图"><FiX /></button>
            <button type="button" className="storyboard-lightbox__nav storyboard-lightbox__nav--previous" onClick={() => setSelectedIndex((selectedIndex - 1 + storyboards.length) % storyboards.length)} aria-label="查看上一张"><FiChevronLeft /></button>
            <figure><img src={selected.src} alt={selected.alt} /><figcaption>{String(selectedIndex + 1).padStart(2, '0')} / {storyboards.length} · {selected.alt}</figcaption></figure>
            <button type="button" className="storyboard-lightbox__nav storyboard-lightbox__nav--next" onClick={() => setSelectedIndex((selectedIndex + 1) % storyboards.length)} aria-label="查看下一张"><FiChevronRight /></button>
        </div>}
    </section>;
};

export default Experimental;
