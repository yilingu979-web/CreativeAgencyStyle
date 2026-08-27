import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { isDragGesture, projects, shouldPlayPreview } from './workModel';
import './Work.css';

const Work = () => {
    const trackRef = useRef(null);
    const previewRefs = useRef(new Map());
    const visiblePreviews = useRef(new Set());
    const fullVideoRef = useRef(null);
    const lightboxRef = useRef(null);
    const scrollPositionRef = useRef(0);
    const drag = useRef({ active: false, suppressClick: false, startX: 0, startY: 0, startScroll: 0 });
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
        const body = document.body;
        const root = document.documentElement;
        const appRoot = document.getElementById('root');
        const previousFocus = document.activeElement;
        const onKeyDown = (event) => {
            if (event.key === 'Escape') closeFilm();
            if (event.key !== 'Tab' || !lightboxRef.current) return;
            const focusable = [...lightboxRef.current.querySelectorAll('button, video')];
            const first = focusable[0];
            const last = focusable.at(-1);
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
            }
        };
        scrollPositionRef.current = window.scrollY;
        const previousOverflow = document.body.style.overflow;
        const previousRootOverflow = root.style.overflow;
        const previousPosition = body.style.position;
        const previousTop = body.style.top;
        const previousWidth = body.style.width;
        root.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
        body.style.top = `-${scrollPositionRef.current}px`;
        body.style.width = '100%';
        appRoot.inert = true;
        window.dispatchEvent(new Event('work-lightbox:open'));
        window.addEventListener('keydown', onKeyDown);
        requestAnimationFrame(() => lightboxRef.current?.querySelector('button')?.focus());
        return () => {
            root.style.overflow = previousRootOverflow;
            body.style.overflow = previousOverflow;
            body.style.position = previousPosition;
            body.style.top = previousTop;
            body.style.width = previousWidth;
            window.scrollTo(0, scrollPositionRef.current);
            appRoot.inert = false;
            window.dispatchEvent(new Event('work-lightbox:close'));
            window.removeEventListener('keydown', onKeyDown);
            previousFocus?.focus();
        };
    }, [activeProject, closeFilm]);

    const openFilm = (project) => {
        if (drag.current.suppressClick) return;
        syncPreviews(project);
        flushSync(() => setActiveProject(project));
        if (fullVideoRef.current) {
            fullVideoRef.current.muted = false;
            fullVideoRef.current.play().catch(() => {});
        }
    };

    const startDrag = (event) => {
        if (event.button !== 0) return;
        drag.current = { active: true, suppressClick: false, startX: event.clientX, startY: event.clientY, startScroll: trackRef.current.scrollLeft };
    };
    const moveDrag = (event) => {
        if (!drag.current.active) return;
        const distance = event.clientX - drag.current.startX;
        const verticalDistance = event.clientY - drag.current.startY;
        if (!isDragGesture(distance, verticalDistance)) return;
        if (!drag.current.suppressClick) {
            drag.current.suppressClick = true;
            trackRef.current.setPointerCapture(event.pointerId);
        }
        trackRef.current.scrollLeft = drag.current.startScroll - distance;
    };
    const endDrag = () => {
        drag.current.active = false;
        requestAnimationFrame(() => { drag.current.suppressClick = false; });
    };

    const activatePointer = (event, project) => {
        if (event.isPrimary && event.button === 0) openFilm(project);
    };

    return (
        <section id="selected-works" className="selected-works relative h-screen bg-transparent text-secondary overflow-hidden" aria-labelledby="selected-works-title">
            <div className="selected-works__eyebrow absolute top-10 left-10 md:left-20 z-10">
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-secondary/60">Selected Works</h2>
            </div>
            <div ref={trackRef} className="selected-works__track" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
                <header className="selected-works__intro">
                    <h3 id="selected-works-title" className="selected-works__title font-display font-bold"><span>精选</span><span className="selected-works__gold">作品</span></h3>
                    <p className="selected-works__subtitle">Our Finest Work</p>
                </header>
                {projects.map((project) => (
                    <button type="button" key={project.id} className="selected-works__card" onPointerUp={(event) => activatePointer(event, project)} onClick={(event) => event.detail === 0 && openFilm(project)} aria-label={`播放${project.title}完整版`} data-cursor="text" data-cursor-text="VIEW">
                        <video ref={(node) => node ? previewRefs.current.set(project.id, node) : previewRefs.current.delete(project.id)} className="selected-works__preview" data-project-id={project.id} src={project.preview} muted autoPlay loop playsInline preload="metadata" />
                        <span className="selected-works__shade" />
                        <span className="selected-works__label">
                            <span className="selected-works__play" aria-hidden="true">▶</span>
                            <span className="selected-works__meta">
                                <span className="selected-works__card-title">{project.cardTitle}</span>
                                <span className="selected-works__category">{project.category}</span>
                            </span>
                        </span>
                    </button>
                ))}
                <div className="selected-works__end" aria-hidden="true" />
            </div>
            <button type="button" className="selected-works__next" onClick={() => trackRef.current?.scrollBy({ left: trackRef.current.clientWidth * 0.72, behavior: 'smooth' })} aria-label="浏览下一个作品"><span />→</button>
            {activeProject && createPortal(
                <div ref={lightboxRef} className="work-lightbox" role="dialog" aria-modal="true" aria-label={`${activeProject.title}完整版`} data-lenis-prevent onMouseDown={(event) => event.target === event.currentTarget && closeFilm()}>
                    <button type="button" className="work-lightbox__close" onClick={closeFilm} aria-label="关闭播放器">×</button>
                    <video ref={fullVideoRef} className="work-lightbox__video" src={activeProject.full} controls autoPlay playsInline preload="metadata" />
                </div>,
                document.body,
            )}
        </section>
    );
};

export default Work;
