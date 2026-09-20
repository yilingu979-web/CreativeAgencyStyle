import {
    buildContactEmail,
    payloadFingerprint,
    validateContactPayload,
} from '../server/contact.js';
import { Buffer } from 'node:buffer';
import { createDirectMailClient } from '../server/directMail.js';

const CONTACT_RECIPIENT = 'postmaster@koujikeji.com';
const DUPLICATE_WINDOW_MS = 60_000;
const MAX_BODY_BYTES = 1_048_576;
const MAX_RECENT_SUBMISSIONS = 500;

const respond = (response, statusCode, payload) => response.status(statusCode).json(payload);

const readBody = (request) => {
    const contentType = request.headers?.['content-type'] ?? request.headers?.['Content-Type'] ?? '';
    const mediaType = contentType.split(';', 1)[0].trim().toLowerCase();
    if (mediaType !== 'application/json') {
        return { ok: false, status: 415, error: '请使用 JSON 格式提交。' };
    }

    const serialized = typeof request.body === 'string'
        ? request.body
        : JSON.stringify(request.body ?? null);

    if (Buffer.byteLength(serialized, 'utf8') > MAX_BODY_BYTES) {
        return { ok: false, status: 413, error: '提交内容过长。' };
    }

    try {
        return {
            ok: true,
            value: typeof request.body === 'string' ? JSON.parse(request.body) : request.body,
        };
    } catch {
        return { ok: false, status: 400, error: '提交内容格式不正确。' };
    }
};

export const sendContactEmail = async ({ data, submittedAt, directMailClient, from }) => {
    const email = buildContactEmail(data, submittedAt);
    await directMailClient.singleSendMail({
        accountName: from,
        toAddress: CONTACT_RECIPIENT,
        replyToAddress: false,
        subject: email.subject,
        htmlBody: email.html,
        textBody: email.text,
    });
    return true;
};

export const createContactHandler = ({
    fetchImpl = fetch,
    directMailClient,
    env = globalThis.process?.env ?? {},
    now = () => new Date(),
} = {}) => {
    const recentSubmissions = new Map();

    return async (request, response) => {
        if (request.method !== 'POST') {
            response.setHeader?.('Allow', 'POST');
            return respond(response, 405, { ok: false, error: '仅支持 POST 请求。' });
        }

        const parsedBody = readBody(request);
        if (!parsedBody.ok) {
            return respond(response, parsedBody.status, { ok: false, error: parsedBody.error });
        }

        const validation = validateContactPayload(parsedBody.value);
        if (!validation.ok) {
            return respond(response, 400, { ok: false, error: validation.error });
        }

        const client = directMailClient ?? createDirectMailClient({
            accessKeyId: env.ALIBABA_CLOUD_ACCESS_KEY_ID,
            accessKeySecret: env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
            accountName: env.DIRECT_MAIL_SENDER,
            fetchImpl,
        });
        if (!env.DIRECT_MAIL_SENDER || (!directMailClient && (!env.ALIBABA_CLOUD_ACCESS_KEY_ID || !env.ALIBABA_CLOUD_ACCESS_KEY_SECRET))) {
            return respond(response, 503, {
                ok: false,
                error: '邮件服务尚未配置，请稍后再试。',
            });
        }

        const currentTime = now();
        const currentTimestamp = currentTime.getTime();
        const fingerprint = payloadFingerprint(validation.data);
        const lastSubmittedAt = recentSubmissions.get(fingerprint);

        if (lastSubmittedAt !== undefined && currentTimestamp - lastSubmittedAt < DUPLICATE_WINDOW_MS) {
            return respond(response, 429, {
                ok: false,
                error: '相同内容刚刚已经提交，请稍后再试。',
            });
        }

        recentSubmissions.set(fingerprint, currentTimestamp);

        try {
            const delivered = await sendContactEmail({
                data: validation.data,
                submittedAt: currentTime.toISOString(),
                directMailClient: client,
                from: env.DIRECT_MAIL_SENDER,
            });

            if (!delivered) {
                recentSubmissions.delete(fingerprint);
                return respond(response, 502, {
                    ok: false,
                    error: '发送失败，请稍后重试。',
                });
            }

            if (recentSubmissions.size > MAX_RECENT_SUBMISSIONS) {
                const oldestFingerprint = recentSubmissions.keys().next().value;
                recentSubmissions.delete(oldestFingerprint);
            }

            return respond(response, 200, { ok: true });
        } catch {
            recentSubmissions.delete(fingerprint);
            return respond(response, 502, {
                ok: false,
                error: '发送失败，请稍后重试。',
            });
        }
    };
};

export default createContactHandler();
