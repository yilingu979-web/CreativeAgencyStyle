import { createHmac, randomUUID } from 'node:crypto';

const endpoint = 'https://dm.aliyuncs.com/';
const encode = (value) => encodeURIComponent(String(value)).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);

const canonicalize = (parameters) => Object.entries(parameters)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${encode(key)}=${encode(value)}`)
    .join('&');

export const createDirectMailClient = ({
    accessKeyId,
    accessKeySecret,
    accountName,
    fetchImpl = fetch,
    now = () => new Date(),
    nonce = randomUUID,
} = {}) => ({
    async singleSendMail({ toAddress, subject, htmlBody, textBody, replyToAddress = false, accountName: requestAccountName } = {}) {
        if (!accessKeyId || !accessKeySecret || !(requestAccountName ?? accountName)) {
            throw new Error('Direct Mail credentials are not configured.');
        }

        const parameters = {
            Action: 'SingleSendMail',
            AccountName: requestAccountName ?? accountName,
            AddressType: 1,
            Format: 'JSON',
            ReplyToAddress: replyToAddress,
            SignatureMethod: 'HMAC-SHA1',
            SignatureNonce: nonce(),
            SignatureVersion: '1.0',
            Timestamp: now().toISOString().replace(/\.\d{3}Z$/, 'Z'),
            ToAddress: toAddress,
            Version: '2015-11-23',
            Subject: subject,
            HtmlBody: htmlBody,
            TextBody: textBody,
            AccessKeyId: accessKeyId,
        };
        const canonicalized = canonicalize(parameters);
        const stringToSign = `POST&%2F&${encode(canonicalized)}`;
        const signature = createHmac('sha1', `${accessKeySecret}&`).update(stringToSign).digest('base64');
        const body = `${canonicalized}&Signature=${encode(signature)}`;
        const response = await fetchImpl(endpoint, {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            body,
        });

        if (!response.ok) {
            throw new Error('Direct Mail rejected the message.');
        }

        return response.json().catch(() => ({}));
    },
});
