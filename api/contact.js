const RECIPIENT = 'postmaster@koujikeji.com';
const RATE_LIMIT_MS = 60_000;
const MIN_FILL_TIME_MS = 1_500;
const MAX_REQUEST_BYTES = 20_000;

const fieldRules = {
    name: { required: '请填写姓名。', max: 80, tooLong: '姓名请控制在 80 字以内。' },
    company: { required: '请填写公司。', max: 120, tooLong: '公司名称请控制在 120 字以内。' },
    contact: { required: '请填写联系方式。', max: 160, tooLong: '联系方式请控制在 160 字以内。' },
    projectDescription: { required: '请填写项目描述。', max: 2000, tooLong: '项目描述请控制在 2000 字以内。' },
};

export function validateContactPayload(payload, now = Date.now()) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return { ok: false, error: '提交内容格式不正确。' };
    }

    if (typeof payload.website === 'string' && payload.website.trim()) {
        return { ok: false, error: '提交未通过验证，请重试。' };
    }

    const formStartedAt = Number(payload.formStartedAt);
    if (!Number.isFinite(formStartedAt) || now - formStartedAt < MIN_FILL_TIME_MS) {
        return { ok: false, error: '提交过快，请稍后重试。' };
    }

    const data = {};
    for (const [field, rule] of Object.entries(fieldRules)) {
        const value = typeof payload[field] === 'string' ? payload[field].trim() : '';
        if (!value) return { ok: false, error: rule.required };
        if (value.length > rule.max) return { ok: false, error: rule.tooLong };
        data[field] = value;
    }

    if (data.contact.length < 3) {
        return { ok: false, error: '请填写有效的邮箱或微信。' };
    }

    const submittedAt = new Date(payload.submittedAt);
    if (Number.isNaN(submittedAt.getTime())) {
        return { ok: false, error: '提交时间无效，请刷新页面后重试。' };
    }

    return { ok: true, data: { ...data, submittedAt: submittedAt.toISOString() } };
}

function getClientIp(headers = {}) {
    const forwarded = headers['x-forwarded-for'] || headers['X-Forwarded-For'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    return headers['x-real-ip'] || headers['X-Real-Ip'] || 'unknown';
}

function buildEmail(data, receivedAt) {
    return {
        to: RECIPIENT,
        subject: `扣寂官网项目咨询｜${data.name}｜${data.company}`,
        text: [
            '收到一条来自扣寂官网的项目咨询：',
            '',
            `姓名：${data.name}`,
            `公司：${data.company}`,
            `联系方式：${data.contact}`,
            '项目描述：',
            data.projectDescription,
            '',
            `访客提交时间：${data.submittedAt}`,
            `服务端接收时间：${receivedAt}`,
        ].join('\n'),
    };
}

export async function sendWithResend(message, env = globalThis.process?.env || {}, fetchImpl = fetch) {
    const apiKey = env.RESEND_API_KEY;
    const from = env.CONTACT_FROM_EMAIL;
    if (!apiKey || !from) {
        throw new Error('Email service is not configured');
    }

    const response = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, ...message }),
        signal: AbortSignal.timeout(10_000),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.id) {
        throw new Error(`Email provider rejected request (${response.status})`);
    }
    return result;
}

export function createContactHandler({ sendEmail = sendWithResend, now = Date.now } = {}) {
    const recentSubmissions = new Map();
    const inFlight = new Set();

    return async function handleContactRequest(request) {
        if (request.method !== 'POST') {
            return { status: 405, body: { ok: false, error: '请求方式不受支持。' }, headers: { Allow: 'POST' } };
        }

        const contentLength = Number(request.headers?.['content-length'] || 0);
        if (contentLength > MAX_REQUEST_BYTES) {
            return { status: 413, body: { ok: false, error: '提交内容过长。' } };
        }

        const currentTime = now();
        const validation = validateContactPayload(request.body, currentTime);
        if (!validation.ok) {
            return { status: 400, body: { ok: false, error: validation.error } };
        }

        const clientIp = getClientIp(request.headers);
        const lastSubmission = recentSubmissions.get(clientIp) || 0;
        if (inFlight.has(clientIp) || currentTime - lastSubmission < RATE_LIMIT_MS) {
            return { status: 429, body: { ok: false, error: '提交有点频繁，请稍后再试。' } };
        }

        recentSubmissions.set(clientIp, currentTime);
        inFlight.add(clientIp);
        try {
            const message = buildEmail(validation.data, new Date(currentTime).toISOString());
            await sendEmail(message);
            return { status: 200, body: { ok: true } };
        } catch (error) {
            console.error('Contact email delivery failed:', error instanceof Error ? error.message : error);
            return { status: 502, body: { ok: false, error: '暂时无法发送，请稍后重试。' } };
        } finally {
            inFlight.delete(clientIp);
        }
    };
}

const contactHandler = createContactHandler();

export default async function handler(request, response) {
    const result = await contactHandler(request);
    for (const [name, value] of Object.entries(result.headers || {})) {
        response.setHeader(name, value);
    }
    return response.status(result.status).json(result.body);
}
