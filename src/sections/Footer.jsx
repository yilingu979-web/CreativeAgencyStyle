import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { validateContactForm } from '../lib/contactForm';

gsap.registerPlugin(ScrollTrigger);

const initialForm = {
    name: '',
    company: '',
    contact: '',
    projectDescription: '',
};

const Footer = () => {
    const footerRef = useRef(null);
    const brandRef = useRef(null);
    const formRef = useRef(null);
    const formStartedAt = useRef(null);
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle');
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        formStartedAt.current = Date.now();
        const context = gsap.context(() => {
            gsap.fromTo(
                [brandRef.current, formRef.current],
                { y: 60, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.1,
                    stagger: 0.16,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: footerRef.current,
                        start: 'top 78%',
                        toggleActions: 'play none none reverse',
                    },
                },
            );
        }, footerRef);

        return () => context.revert();
    }, []);

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: undefined }));
        if (status !== 'idle') {
            setStatus('idle');
            setStatusMessage('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (status === 'loading') return;

        const nextErrors = validateContactForm(form);
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            setStatus('error');
            setStatusMessage('请检查标出的内容。');
            return;
        }

        setErrors({});
        setStatus('loading');
        setStatusMessage('正在发送…');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    submittedAt: new Date().toISOString(),
                    formStartedAt: formStartedAt.current || Date.now(),
                    website: event.currentTarget.elements.website.value,
                }),
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok || !result.ok) {
                throw new Error(result.error || '发送失败，请稍后重试。');
            }

            setForm(initialForm);
            formStartedAt.current = Date.now();
            setStatus('success');
            setStatusMessage('已收到，我们会尽快与你联系。');
        } catch (error) {
            setStatus('error');
            setStatusMessage(error instanceof Error ? error.message : '发送失败，请稍后重试。');
        }
    };

    const fieldClass = 'w-full border-0 border-b border-secondary/20 bg-transparent px-0 py-3 text-base md:text-lg font-sans text-secondary outline-none transition-colors duration-300 placeholder:text-secondary/30 focus:border-accent disabled:opacity-50 cursor-text';

    return (
        <footer ref={footerRef} className="bg-primary text-secondary px-6 py-20 md:px-20 md:py-28 min-h-screen flex items-center overflow-hidden">
            <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-20 md:grid-cols-2 md:gap-12 lg:gap-24">
                <div ref={brandRef} className="flex flex-col items-start md:min-h-[620px]">
                    <div>
                        <h2 className="text-[clamp(3.6rem,9vw,8.5rem)] font-display font-bold leading-[0.9] tracking-[-0.055em]" data-cursor="hover">
                            联系我们
                        </h2>
                        <p className="mt-4 text-sm md:text-base font-display font-semibold tracking-[0.22em] text-secondary/65">
                            LET&apos;S CREATE.
                        </p>
                    </div>

                    <div className="mt-16 md:mt-auto space-y-2 text-lg md:text-xl font-sans text-secondary/75">
                        <p>Koujikeji.com</p>
                        <p>postmaster@koujikeji.com</p>
                    </div>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col" noValidate aria-busy={status === 'loading'}>
                    <div className="space-y-8 md:space-y-10">
                        <div>
                            <label htmlFor="name" className="block text-xs font-sans tracking-[0.2em] text-secondary/50">01 / 姓名</label>
                            <input id="name" name="name" value={form.name} onChange={updateField} placeholder="怎么称呼你？" maxLength="80" required disabled={status === 'loading'} className={fieldClass} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} />
                            {errors.name && <p id="name-error" className="mt-2 text-xs text-accent">{errors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="company" className="block text-xs font-sans tracking-[0.2em] text-secondary/50">02 / 公司</label>
                            <input id="company" name="company" value={form.company} onChange={updateField} placeholder="你的品牌或公司" maxLength="120" required disabled={status === 'loading'} className={fieldClass} aria-invalid={Boolean(errors.company)} aria-describedby={errors.company ? 'company-error' : undefined} />
                            {errors.company && <p id="company-error" className="mt-2 text-xs text-accent">{errors.company}</p>}
                        </div>

                        <div>
                            <label htmlFor="contact" className="block text-xs font-sans tracking-[0.2em] text-secondary/50">03 / 联系方式</label>
                            <input id="contact" name="contact" value={form.contact} onChange={updateField} placeholder="邮箱或微信" maxLength="160" required disabled={status === 'loading'} className={fieldClass} aria-invalid={Boolean(errors.contact)} aria-describedby={errors.contact ? 'contact-error' : undefined} />
                            {errors.contact && <p id="contact-error" className="mt-2 text-xs text-accent">{errors.contact}</p>}
                        </div>

                        <div>
                            <label htmlFor="projectDescription" className="block text-xs font-sans tracking-[0.2em] text-secondary/50">04 / 项目描述</label>
                            <textarea id="projectDescription" name="projectDescription" value={form.projectDescription} onChange={updateField} placeholder="你想让我们一起创造什么？" rows="4" maxLength="2000" required disabled={status === 'loading'} className={`${fieldClass} resize-none`} aria-invalid={Boolean(errors.projectDescription)} aria-describedby={errors.projectDescription ? 'project-description-error' : undefined} />
                            {errors.projectDescription && <p id="project-description-error" className="mt-2 text-xs text-accent">{errors.projectDescription}</p>}
                        </div>
                    </div>

                    <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                        <label htmlFor="website">Website</label>
                        <input id="website" name="website" type="text" tabIndex="-1" autoComplete="off" />
                    </div>

                    <button type="submit" disabled={status === 'loading'} className="group mt-12 flex min-h-14 w-full items-center justify-between border border-secondary/30 px-5 py-4 text-left text-base md:text-lg font-display font-semibold transition-all duration-300 hover:border-secondary hover:bg-secondary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50" data-cursor="hover">
                        <span>{status === 'loading' ? '正在发送…' : '与扣寂开启创作 ↗'}</span>
                        <span className="h-2 w-2 rounded-full bg-accent transition-transform duration-300 group-hover:scale-150" />
                    </button>

                    <p role="status" aria-live="polite" className={`mt-4 min-h-6 text-sm font-sans ${status === 'success' ? 'text-secondary' : status === 'error' ? 'text-accent' : 'text-secondary/50'}`}>
                        {statusMessage}
                    </p>
                </form>
            </div>
        </footer>
    );
};

export default Footer;
