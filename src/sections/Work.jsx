import React, { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { projects, shouldPlayPreview } from './workModel';
import './Work.css';

const Work = () => {
    const trackRef = useRef(null);
    const previewRefs = useRef(new Map());
    const visiblePreviews = useRef(new Set());
    const fullVideoRef = useRef(null);
    const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });
    const [activeProject, setActiveProject] = useState(null);

    const syncPreviews = useCallback((openFilm = activeProject) => {
        previewRefs.current.forEach((video, id) => {
            if (shouldPlayPreview({ isVisible: visiblePreviews.current.has(id), hasOpenFilm: Boolean(openFilm) })) video.play().catch(() => {});
            else video.pause();
        });
    }, [activeProject]);

    const closeFilm = useCallback(() => {
        fullVideoRef.current?.pause();
        setActiveProject(null);
        requestAnimationFrame(() => syncPreviews(null));
    }, [syncPreviews]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const id = entry.target.dataset.projectId;
                if (entry.isIntersecting) visiblePreviews.current.add(id);
                else visiblePreviews.current.delete(id);
            });
            syncPreviews();
        }, { threshold: 0.35 });
        previewRefs.current.forEach((video) => observer.observe(video));
        return () => observer.disconnect();
    }, [syncPreviews]);

    useEffect(() => {
        if (!activeProject) return undefined;
        const onKeyDown = (event) => event.key === 'Escape' && closeFilm();
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [activeProject, closeFilm]);

    const openFilm = (project) => {
        if (drag.current.moved) return;
        syncPreviews(project);
        flushSync(() => setActiveProject(project));
        fullVideoRef.current?.play().catch(() => {});
    };

    const startDrag = (event) => {
        if (event.button !== 0) return;
        drag.current = { active: true, moved: false, startX: event.clientX, startScroll: trackRef.current.scrollLeft };
        trackRef.current.setPointerCapture(event.pointerId);
    };
    const moveDrag = (event) => {
        if (!drag.current.active) return;
        const distance = event.clientX - drag.current.startX;
        if (Math.abs(distance) > 5) drag.current.moved = true;
        trackRef.current.scrollLeft = drag.current.startScroll - distance;
    };
    const endDrag = () => {
        drag.current.active = false;
        requestAnimationFrame(() => { drag.current.moved = false; });
    };

    return (
        <section className="selected-works relative h-screen bg-primary text-secondary overflow-hidden" aria-labelledby="selected-works-title">
            <div className="selected-works__eyebrow absolute top-10 left-10 md:left-20 z-10">
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-secondary/60">Selected Works</h2>
            </div>
            <div ref={trackRef} className="selected-works__track" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
                <header className="selected-works__intro">
                    <h3 id="selected-works-title" className="selected-works__title font-display font-bold"><span>精选</span><span className="selected-works__gold">作品</span></h3>
                    <p className="selected-works__subtitle">Our Finest Work</p>
                </header>
                {projects.map((project) => (
                    <button type="button" key={project.id} className="selected-works__card" onClick={() => openFilm(project)} aria-label={`播放${project.title}完整版`} data-cursor="text" data-cursor-text="VIEW">
                        <video ref={(node) => node ? previewRefs.current.set(project.id, node) : previewRefs.current.delete(project.id)} className="selected-works__preview" data-project-id={project.id} src={project.preview} muted autoPlay loop playsInline preload="metadata" />
                        <span className="selected-works__shade" />
                        <span className="selected-works__label"><span className="selected-works__play" aria-hidden="true">▶</span><span>{project.title}</span></span>
                    </button>
                ))}
                <div className="selected-works__end" aria-hidden="true" />
            </div>
            <button type="button" className="selected-works__next" onClick={() => trackRef.current?.scrollBy({ left: trackRef.current.clientWidth * 0.72, behavior: 'smooth' })} aria-label="浏览下一个作品"><span />→</button>
            {activeProject && (
                <div className="work-lightbox" role="dialog" aria-modal="true" aria-label={`${activeProject.title}完整版`} onMouseDown={(event) => event.target === event.currentTarget && closeFilm()}>
                    <button type="button" className="work-lightbox__close" onClick={closeFilm} aria-label="关闭播放器">×</button>
                    <video ref={fullVideoRef} className="work-lightbox__video" src={activeProject.full} controls autoPlay playsInline preload="metadata" />
                </div>
            )}
        </section>
    );
};

export default Work;
