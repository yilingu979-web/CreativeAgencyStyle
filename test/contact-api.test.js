import assert from 'node:assert/strict';
import test from 'node:test';

import { createContactHandler, sendWithResend, validateContactPayload } from '../api/contact.js';

const validPayload = {
    name: '林一',
    company: '扣寂科技',
    contact: '微信 kouji-studio',
    projectDescription: '希望共同制作一支品牌概念片。',
    submittedAt: '2026-08-23T15:00:00.000Z',
    formStartedAt: Date.now() - 5000,
    website: '',
};

test('validateContactPayload trims and accepts a valid enquiry', () => {
    const result = validateContactPayload({
        ...validPayload,
        name: '  林一  ',
        company: '  扣寂科技  ',
    });

    assert.equal(result.ok, true);
    assert.equal(result.data.name, '林一');
    assert.equal(result.data.company, '扣寂科技');
});

test('validateContactPayload rejects missing and overlong fields', () => {
    const missing = validateContactPayload({ ...validPayload, contact: '' });
    const overlong = validateContactPayload({
        ...validPayload,
        projectDescription: '项'.repeat(2001),
    });

    assert.equal(missing.ok, false);
    assert.equal(missing.error, '请填写联系方式。');
    assert.equal(overlong.ok, false);
    assert.equal(overlong.error, '项目描述请控制在 2000 字以内。');
});

test('validateContactPayload rejects bots and impossibly fast submissions', () => {
    const honeypot = validateContactPayload({ ...validPayload, website: 'spam.example' });
    const tooFast = validateContactPayload({ ...validPayload, formStartedAt: Date.now() });

    assert.equal(honeypot.ok, false);
    assert.equal(tooFast.ok, false);
});

test('contact handler sends only after validation and returns success after provider confirmation', async () => {
    let sentMessage;
    const now = Date.parse('2026-08-23T15:01:00.000Z');
    const handler = createContactHandler({
        now: () => now,
        sendEmail: async (message) => {
            sentMessage = message;
            return { id: 'email_123' };
        },
    });
    const response = await handler({
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.10' },
        body: { ...validPayload, formStartedAt: now - 5000 },
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { ok: true });
    assert.equal(sentMessage.to, 'postmaster@koujikeji.com');
    assert.match(sentMessage.subject, /扣寂官网项目咨询/);
    assert.match(sentMessage.text, /微信 kouji-studio/);
    assert.match(sentMessage.text, /提交时间/);
});

test('contact handler returns an error when the email provider fails', async () => {
    const handler = createContactHandler({
        sendEmail: async () => {
            throw new Error('provider unavailable');
        },
    });
    const response = await handler({
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.11' },
        body: validPayload,
    });

    assert.equal(response.status, 502);
    assert.equal(response.body.ok, false);
    assert.equal((await handler({
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.11' },
        body: validPayload,
    })).status, 429);
});

test('contact handler rate-limits repeated requests from the same client', async () => {
    let now = 100_000;
    const handler = createContactHandler({
        now: () => now,
        sendEmail: async () => ({ id: 'email_123' }),
    });
    const request = {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.12' },
        body: { ...validPayload, formStartedAt: now - 5000 },
    };

    assert.equal((await handler(request)).status, 200);
    now += 1000;
    assert.equal((await handler(request)).status, 429);
});

test('sendWithResend keeps credentials server-side and requires provider confirmation', async () => {
    let providerRequest;
    const result = await sendWithResend(
        { to: 'postmaster@koujikeji.com', subject: '测试', text: '正文' },
        { RESEND_API_KEY: 'secret-test-key', CONTACT_FROM_EMAIL: 'Kouji <contact@example.com>' },
        async (url, options) => {
            providerRequest = { url, options };
            return { ok: true, status: 200, json: async () => ({ id: 'email_456' }) };
        },
    );

    assert.equal(result.id, 'email_456');
    assert.equal(providerRequest.url, 'https://api.resend.com/emails');
    assert.equal(providerRequest.options.headers.Authorization, 'Bearer secret-test-key');
    assert.deepEqual(JSON.parse(providerRequest.options.body), {
        from: 'Kouji <contact@example.com>',
        to: 'postmaster@koujikeji.com',
        subject: '测试',
        text: '正文',
    });
});

test('sendWithResend refuses to run without configured credentials', async () => {
    await assert.rejects(
        sendWithResend({ to: 'postmaster@koujikeji.com' }, {}),
        /not configured/,
    );
});
