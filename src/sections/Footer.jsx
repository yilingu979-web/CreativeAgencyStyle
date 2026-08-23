import React, { useState } from 'react';

const initialForm = {
    name: '',
    company: '',
    contact: '',
    projectDescription: '',
    website: '',
};

const fieldClassName = 'w-full bg-transparent border-b border-secondary/25 py-4 text-base md:text-lg font-sans text-secondary placeholder:text-secondary/40 outline-none transition-colors duration-300 focus:border-accent';

const Footer = () => {
    const [form, setForm] = useState(initialForm);
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok || !result.ok) {
                throw new Error(result.error || '发送失败，请稍后重试。');
            }

            setStatus('success');
            setMessage('已收到，我们会尽快与你联系。');
            setForm(initialForm);
        } catch (error) {
            setStatus('error');
            setMessage(error instanceof Error ? error.message : '发送失败，请稍后重试。');
        }
    };

    return (
        <footer className="bg-primary text-secondary pt-20 pb-12 px-6 md:px-20 min-h-[70vh] flex flex-col justify-between">
            <div className="flex flex-col md:flex-row justify-between items-start gap-16 md:gap-12 lg:gap-24">
                <div className="w-full md:w-5/12 flex flex-col items-start">
                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-tight" data-cursor="hover">
                        联系我们
                    </h2>
                    <p className="mt-4 text-lg md:text-2xl font-display font-bold tracking-[0.12em] whitespace-nowrap text-secondary/70">
                        LET&apos;S CREATE.
                    </p>

                    <div className="mt-10 md:mt-12 flex flex-col gap-2 text-base md:text-xl font-sans text-secondary/75">
                        <span>Koujikeji.com</span>
                        <span>postmaster@koujikeji.com</span>
                    </div>
                </div>

                <form className="w-full md:w-1/2 lg:max-w-xl" onSubmit={handleSubmit}>
                    <div className="absolute left-[-9999px] h-px w-px overflow-hidden" aria-hidden="true">
                        <label htmlFor="website">Website</label>
                        <input
                            id="website"
                            name="website"
                            value={form.website}
                            onChange={handleChange}
                            tabIndex={-1}
                            autoComplete="off"
                        />
                    </div>

                    <label className="block">
                        <span className="sr-only">姓名</span>
                        <input
                            className={fieldClassName}
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="怎么称呼你？"
                            autoComplete="name"
                            minLength={1}
                            maxLength={80}
                            required
                        />
                    </label>
                    <label className="block">
                        <span className="sr-only">公司</span>
                        <input
                            className={fieldClassName}
                            type="text"
                            name="company"
                            value={form.company}
                            onChange={handleChange}
                            placeholder="你的品牌或公司"
                            autoComplete="organization"
                            minLength={1}
                            maxLength={120}
                            required
                        />
                    </label>
                    <label className="block">
                        <span className="sr-only">联系方式</span>
                        <input
                            className={fieldClassName}
                            type="text"
                            name="contact"
                            value={form.contact}
                            onChange={handleChange}
                            placeholder="邮箱或微信"
                            autoComplete="email"
                            minLength={3}
                            maxLength={160}
                            required
                        />
                    </label>
                    <label className="block">
                        <span className="sr-only">项目描述</span>
                        <textarea
                            className={`${fieldClassName} min-h-32 resize-y`}
                            name="projectDescription"
                            value={form.projectDescription}
                            onChange={handleChange}
                            placeholder="你想让我们一起创造什么？"
                            minLength={10}
                            maxLength={3000}
                            required
                        />
                    </label>

                    <button
                        className="mt-8 w-full md:w-auto px-8 py-4 border border-secondary/30 rounded-full font-medium tracking-wide transition-all duration-300 hover:bg-secondary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                        type="submit"
                        data-cursor="hover"
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? '正在发送…' : '与扣寂开启创作 ↗'}
                    </button>

                    {message && (
                        <p
                            className={`mt-5 text-sm font-sans ${status === 'success' ? 'text-accent' : 'text-red-300'}`}
                            role="status"
                            aria-live="polite"
                        >
                            {message}
                        </p>
                    )}
                </form>
            </div>
        </footer>
    );
};

export default Footer;
