import { createHash } from 'node:crypto';

const FIELD_RULES = {
    name: { label: '姓名', min: 1, max: 80 },
    company: { label: '公司', min: 1, max: 120 },
    contact: { label: '联系方式', min: 3, max: 160 },
    projectDescription: { label: '项目描述', min: 10, max: 3000 },
};

const escapeHtml = (value) => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

export const validateContactPayload = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return { ok: false, error: '提交内容格式不正确。' };
    }

    if (typeof value.website !== 'undefined' && typeof value.website !== 'string') {
        return { ok: false, error: '提交内容格式不正确。' };
    }

    if (value.website?.trim()) {
        return { ok: false, error: '无法处理本次提交。' };
    }

    const data = {};

    for (const [field, rule] of Object.entries(FIELD_RULES)) {
        const rawValue = value[field];

        if (typeof rawValue !== 'string') {
            return { ok: false, error: `请填写${rule.label}。` };
        }

        const normalizedValue = rawValue.trim();
        if (normalizedValue.length < rule.min || normalizedValue.length > rule.max) {
            return {
                ok: false,
                error: `${rule.label}长度需要在 ${rule.min}–${rule.max} 个字符之间。`,
            };
        }

        data[field] = normalizedValue;
    }

    return { ok: true, data };
};

export const buildContactEmail = (data, submittedAt) => {
    const rows = [
        ['姓名', data.name],
        ['公司', data.company],
        ['联系方式', data.contact],
        ['项目描述', data.projectDescription],
        ['提交时间', submittedAt],
    ];

    return {
        subject: `新的扣寂项目咨询：${data.name}`,
        text: rows.map(([label, content]) => `${label}：${content}`).join('\n\n'),
        html: `<div style="font-family:Arial,'PingFang SC',sans-serif;line-height:1.7;color:#171717">${rows
            .map(([label, content]) => `<p><strong>${label}：</strong><br>${escapeHtml(content).replaceAll('\n', '<br>')}</p>`)
            .join('')}</div>`,
    };
};

export const payloadFingerprint = (data) => createHash('sha256')
    .update([data.name, data.company, data.contact, data.projectDescription].join('\u0000'))
    .digest('hex');
