import test from 'node:test';
import assert from 'node:assert/strict';
import { createDirectMailClient } from './directMail.js';

test('Direct Mail client signs and submits complete single-mail data', async () => {
    let captured;
    const client = createDirectMailClient({
        accessKeyId: 'test-key',
        accessKeySecret: 'test-secret',
        accountName: 'postmaster@koujikeji.com',
        now: () => new Date('2026-09-20T00:00:00.000Z'),
        nonce: () => 'fixed-nonce',
        fetchImpl: async (url, options) => {
            captured = { url, options };
            return new Response(JSON.stringify({ EnvId: 'mail_123' }), { status: 200 });
        },
    });

    await client.singleSendMail({
        toAddress: 'postmaster@koujikeji.com',
        subject: '新的叩寂项目咨询：林一',
        htmlBody: '<p>完整需求</p>',
        textBody: '完整需求',
        replyToAddress: false,
    });

    assert.equal(captured.url, 'https://dm.aliyuncs.com/');
    assert.equal(captured.options.method, 'POST');
    assert.match(captured.options.body, /Action=SingleSendMail/);
    assert.match(captured.options.body, /AccountName=postmaster%40koujikeji.com/);
    assert.match(captured.options.body, /ToAddress=postmaster%40koujikeji.com/);
    assert.match(captured.options.body, /Signature=/);
});
