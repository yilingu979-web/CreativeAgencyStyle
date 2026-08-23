import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildContactEmail,
    payloadFingerprint,
    validateContactPayload,
} from './contact.js';
import { createContactHandler } from '../api/contact.js';

const validPayload = {
    name: '  林一  ',
    company: '  扣寂科技  ',
    contact: '  hello@example.com  ',
    projectDescription: '  想制作一支结合 AI 的品牌影像。  ',
    website: '',
};

test('normalizes a valid contact submission', () => {
    const result = validateContactPayload(validPayload);

    assert.deepEqual(result, {
        ok: true,
        data: {
            name: '林一',
            company: '扣寂科技',
            contact: 'hello@example.com',
            projectDescription: '想制作一支结合 AI 的品牌影像。',
        },
    });
});

test('rejects missing, short, and oversized fields', () => {
    const cases = [
        { ...validPayload, name: '' },
        { ...validPayload, company: 'x'.repeat(121) },
        { ...validPayload, contact: 'ab' },
        { ...validPayload, projectDescription: '太短' },
        { ...validPayload, projectDescription: 'x'.repeat(3001) },
    ];

    for (const payload of cases) {
        const result = validateContactPayload(payload);
        assert.equal(result.ok, false);
        assert.equal(typeof result.error, 'string');
    }
});

test('rejects non-string fields and a filled honeypot', () => {
    assert.equal(validateContactPayload({ ...validPayload, contact: 123 }).ok, false);
    assert.equal(validateContactPayload({ ...validPayload, website: 'spam.example' }).ok, false);
});

test('builds escaped email content with every field and submitted time', () => {
    const submittedAt = '2026-08-23T08:00:00.000Z';
    const email = buildContactEmail({
        name: '<林一>',
        company: '扣寂 & Co.',
        contact: 'hello@example.com',
        projectDescription: '第一行\n第二行',
    }, submittedAt);

    assert.equal(email.subject, '新的扣寂项目咨询：<林一>');
    assert.match(email.text, /姓名：<林一>/);
    assert.match(email.text, /公司：扣寂 & Co\./);
    assert.match(email.text, /联系方式：hello@example\.com/);
    assert.match(email.text, /第一行\n第二行/);
    assert.match(email.text, /2026-08-23T08:00:00\.000Z/);
    assert.doesNotMatch(email.html, /<林一>/);
    assert.match(email.html, /&lt;林一&gt;/);
    assert.match(email.html, /扣寂 &amp; Co\./);
    assert.match(email.html, /第一行<br>第二行/);
});

test('creates the same fingerprint for equivalent normalized payloads', () => {
    const first = validateContactPayload(validPayload);
    const second = validateContactPayload({
        ...validPayload,
        name: '林一',
        company: '扣寂科技',
        contact: 'hello@example.com',
        projectDescription: '想制作一支结合 AI 的品牌影像。',
    });

    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    assert.equal(payloadFingerprint(first.data), payloadFingerprint(second.data));
    assert.notEqual(
        payloadFingerprint(first.data),
        payloadFingerprint({ ...first.data, contact: 'wechat-id' }),
    );
});

const createResponse = () => ({
    statusCode: 200,
    payload: undefined,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(payload) {
        this.payload = payload;
        return this;
    },
});

const normalizedRequestBody = {
    name: '林一',
    company: '扣寂科技',
    contact: 'hello@example.com',
    projectDescription: '想制作一支结合 AI 的品牌影像。',
    website: '',
};

test('contact handler rejects unsupported methods and invalid payloads', async () => {
    const handler = createContactHandler({
        fetchImpl: async () => assert.fail('provider must not be called'),
        env: { RESEND_API_KEY: 'key', CONTACT_FROM_EMAIL: 'Kouji <contact@example.com>' },
    });
    const methodResponse = createResponse();
    await handler({ method: 'GET' }, methodResponse);
    assert.equal(methodResponse.statusCode, 405);

    const payloadResponse = createResponse();
    await handler({ method: 'POST', headers: { 'content-type': 'application/json' }, body: {} }, payloadResponse);
    assert.equal(payloadResponse.statusCode, 400);
    assert.equal(payloadResponse.payload.ok, false);

    const contentTypeResponse = createResponse();
    await handler({
        method: 'POST',
        headers: { 'content-type': 'application/jsonp' },
        body: normalizedRequestBody,
    }, contentTypeResponse);
    assert.equal(contentTypeResponse.statusCode, 415);
});

test('contact handler reports missing server credentials without calling provider', async () => {
    const handler = createContactHandler({
        fetchImpl: async () => assert.fail('provider must not be called'),
        env: {},
    });
    const response = createResponse();

    await handler({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: normalizedRequestBody,
    }, response);

    assert.equal(response.statusCode, 503);
    assert.equal(response.payload.ok, false);
});

test('contact handler sends the complete Resend request and confirms provider success', async () => {
    let capturedRequest;
    const handler = createContactHandler({
        fetchImpl: async (url, options) => {
            capturedRequest = { url, options };
            return new Response(JSON.stringify({ id: 'email_123' }), {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
        },
        env: { RESEND_API_KEY: 'secret-key', CONTACT_FROM_EMAIL: 'Kouji <contact@example.com>' },
        now: () => new Date('2026-08-23T08:00:00.000Z'),
    });
    const response = createResponse();

    await handler({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: normalizedRequestBody,
    }, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.payload, { ok: true });
    assert.equal(capturedRequest.url, 'https://api.resend.com/emails');
    assert.equal(capturedRequest.options.headers.Authorization, 'Bearer secret-key');
    const providerBody = JSON.parse(capturedRequest.options.body);
    assert.equal(providerBody.from, 'Kouji <contact@example.com>');
    assert.deepEqual(providerBody.to, ['postmaster@koujikeji.com']);
    assert.match(providerBody.text, /林一/);
    assert.match(providerBody.text, /扣寂科技/);
    assert.match(providerBody.text, /hello@example\.com/);
    assert.match(providerBody.text, /想制作一支结合 AI 的品牌影像。/);
    assert.match(providerBody.text, /2026-08-23T08:00:00\.000Z/);
});

test('contact handler returns a retryable error when Resend rejects the message', async () => {
    const handler = createContactHandler({
        fetchImpl: async () => new Response('{"message":"provider details"}', { status: 422 }),
        env: { RESEND_API_KEY: 'key', CONTACT_FROM_EMAIL: 'Kouji <contact@example.com>' },
    });
    const response = createResponse();

    await handler({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: normalizedRequestBody,
    }, response);

    assert.equal(response.statusCode, 502);
    assert.equal(response.payload.ok, false);
    assert.doesNotMatch(response.payload.error, /provider details/);
});

test('contact handler blocks a rapid duplicate after successful delivery', async () => {
    let providerCalls = 0;
    const handler = createContactHandler({
        fetchImpl: async () => {
            providerCalls += 1;
            return new Response('{"id":"email_123"}', { status: 200 });
        },
        env: { RESEND_API_KEY: 'key', CONTACT_FROM_EMAIL: 'Kouji <contact@example.com>' },
        now: () => new Date('2026-08-23T08:00:00.000Z'),
    });
    const request = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: normalizedRequestBody,
    };

    await handler(request, createResponse());
    const duplicateResponse = createResponse();
    await handler(request, duplicateResponse);

    assert.equal(duplicateResponse.statusCode, 429);
    assert.equal(providerCalls, 1);
});

test('contact handler reserves an in-flight fingerprint before awaiting Resend', async () => {
    let providerCalls = 0;
    const providerResolvers = [];
    const handler = createContactHandler({
        fetchImpl: async () => {
            providerCalls += 1;
            return new Promise((resolve) => providerResolvers.push(resolve));
        },
        env: { RESEND_API_KEY: 'key', CONTACT_FROM_EMAIL: 'Kouji <contact@example.com>' },
        now: () => new Date('2026-08-23T08:00:00.000Z'),
    });
    const request = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: normalizedRequestBody,
    };
    const firstResponse = createResponse();
    const duplicateResponse = createResponse();

    const firstRequest = handler(request, firstResponse);
    await Promise.resolve();
    const duplicateRequest = handler(request, duplicateResponse);
    await Promise.resolve();
    const callsBeforeDelivery = providerCalls;

    for (const resolve of providerResolvers) {
        resolve(new Response('{"id":"email_123"}', { status: 200 }));
    }
    await Promise.all([firstRequest, duplicateRequest]);

    assert.equal(callsBeforeDelivery, 1);
    assert.equal(providerCalls, 1);
    assert.equal(firstResponse.statusCode, 200);
    assert.equal(duplicateResponse.statusCode, 429);
});
