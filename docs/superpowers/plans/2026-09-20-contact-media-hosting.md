# Contact Form and Media Hosting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve koujikeji.com and its four films reliably on mobile while delivering every valid contact submission to postmaster@koujikeji.com.

**Architecture:** OSS in China (Hong Kong) serves the Vite production build and H.264/AAC media through HTTPS. A separate Alibaba Cloud Function Compute HTTP endpoint handles the contact POST, validates it, and calls Direct Mail `SingleSendMail`; secrets exist only as function environment variables. The browser calls the API origin supplied at build time.

**Tech Stack:** React 19, Vite 7, Node test runner, Alibaba Cloud OSS, Function Compute, API Gateway, Direct Mail SDK.

**Spec:** `docs/superpowers/specs/2026-09-20-contact-media-hosting-design.md`

## Global Constraints

- The public website remains `https://koujikeji.com`.
- The four full films must be Safari-compatible H.264/AAC MP4 assets.
- The project description is required but has no character-count limit in either UI or validation.
- Recipient is exactly `postmaster@koujikeji.com`.
- Credentials must never appear in committed files or Vite browser output.
- Static assets are public; email credentials and the mail endpoint’s provider credentials remain private.

## Review Focus

- A multi-paragraph project description is preserved verbatim in the delivered email; test this in Task 1.
- A request body larger than the operational 16 KiB cap returns a clear 413 response; test this in Task 2.
- Direct Mail provider failure never produces a browser success response; test this in Task 2.
- A mobile browser can request every JS/CSS/media URL with HTTPS; check this in Task 4.
- A release asset with a `.mov` extension is not linked as a full film; assert MP4 URLs in Task 3.

---

### Task 1: Remove the description character restriction

**Files:**
- Modify: `src/sections/Footer.jsx`
- Modify: `server/contact.js`
- Modify: `server/contact.test.js`

**Interfaces:**
- Consumes: `validateContactPayload(value)` from `server/contact.js`.
- Produces: validated `projectDescription` of any non-empty string length and an escaped message from `buildContactEmail(data, submittedAt)`.

- [ ] **Step 1: Write the failing tests**

```js
test('accepts a long multi-paragraph project description unchanged', () => {
  const longDescription = `${'第一段需求。'.repeat(1200)}\n\n第二段补充。`;
  const result = validateContactPayload({ ...validPayload, projectDescription: longDescription });
  assert.equal(result.ok, true);
  assert.equal(result.data.projectDescription, longDescription);
  assert.match(buildContactEmail(result.data, '2026-09-20T00:00:00.000Z').text, /第二段补充。/);
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `node --test server/contact.test.js`

Expected: FAIL because `projectDescription` has a 3000-character validation limit.

- [ ] **Step 3: Implement the minimal validation and UI change**

```js
const FIELD_RULES = {
  name: { label: '姓名', min: 1, max: 80 },
  company: { label: '公司', min: 1, max: 120 },
  contact: { label: '联系方式', min: 3, max: 160 },
  projectDescription: { label: '项目描述', min: 1 },
};

if (normalizedValue.length < rule.min || (rule.max && normalizedValue.length > rule.max)) {
  return { ok: false, error: rule.max ? `${rule.label}长度需要在 ${rule.min}–${rule.max} 个字符之间。` : `请填写${rule.label}。` };
}
```

Delete `minLength={10}` and `maxLength={3000}` from the `textarea` in `Footer.jsx`.

- [ ] **Step 4: Run verification**

Run: `npm test && npm run lint`

Expected: all tests and lint pass.

- [ ] **Step 5: Commit**

```bash
git add src/sections/Footer.jsx server/contact.js server/contact.test.js
git commit -m "fix: allow unrestricted project descriptions"
```

### Task 2: Replace the mail provider with Alibaba Cloud Direct Mail

**Files:**
- Modify: `api/contact.js`
- Modify: `server/contact.test.js`
- Modify: `.env.example`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: `DIRECT_MAIL_SENDER` from server environment and the Function Compute RAM role at runtime.
- Produces: `sendContactEmail({data, submittedAt, directMailClient})`, resolving `true` only when `singleSendMail` accepts the message.

- [ ] **Step 1: Write the failing Direct Mail delivery test**

```js
test('contact handler sends the complete Direct Mail request', async () => {
  let request;
  const directMailClient = { singleSendMail: async (value) => { request = value; return { body: { envId: 'mail_123' } }; } };
  const handler = createContactHandler({ directMailClient, env: { DIRECT_MAIL_SENDER: 'postmaster@koujikeji.com' } });
  const response = createResponse();
  await handler(validRequest, response);
  assert.equal(response.statusCode, 200);
  assert.equal(request.toAddress, 'postmaster@koujikeji.com');
  assert.match(request.htmlBody, /项目描述/);
});
```

Add a second test with `singleSendMail: async () => { throw new Error('provider down'); }` and assert `502` plus `ok: false`.

- [ ] **Step 2: Run tests to verify failure**

Run: `node --test server/contact.test.js`

Expected: FAIL because `createContactHandler` currently expects Resend credentials and calls `https://api.resend.com/emails`.

- [ ] **Step 3: Implement the Direct Mail adapter**

Install `@alicloud/dm20151123` and `@alicloud/openapi-client`. Construct the client from function environment, then issue:

```js
const request = new SingleSendMailRequest({
  accountName: env.DIRECT_MAIL_SENDER,
  addressType: 1,
  replyToAddress: false,
  toAddress: 'postmaster@koujikeji.com',
  subject: email.subject,
  htmlBody: email.html,
  textBody: email.text,
});
await directMailClient.singleSendMail(request);
```

Keep the recipient literal in `api/contact.js`. Replace the Resend environment names in `.env.example` with the three Direct Mail names; do not add values.

- [ ] **Step 4: Run verification**

Run: `npm test && npm run lint && npm run build`

Expected: all commands exit 0 and no source file contains `RESEND_API_KEY`.

- [ ] **Step 5: Commit**

```bash
git add api/contact.js server/contact.test.js .env.example package.json package-lock.json
git commit -m "feat: deliver contact submissions with aliyun direct mail"
```

### Task 3: Prepare a mobile-compatible OSS website and media build

**Files:**
- Modify: `src/sections/workModel.js`
- Modify: `src/sections/workModel.test.js`
- Create: `scripts/build-oss-site.mjs`
- Create: `scripts/verify-media.mjs`

**Interfaces:**
- Consumes: `VITE_MEDIA_ORIGIN`, e.g. `https://media.koujikeji.com`.
- Produces: four full-film URLs ending in `.mp4` under `/works/full/`, and one `dist/` tree with root-relative asset URLs.

- [ ] **Step 1: Write the failing media model test**

```js
test('full films use the configured OSS media origin and MP4 files', () => {
  for (const project of projects) {
    assert.match(project.full, /^https:\/\/media\.koujikeji\.com\/works\/full\/.+\.mp4$/);
    assert.doesNotMatch(project.full, /github\.com|\.mov$/);
  }
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `node --test src/sections/workModel.test.js`

Expected: FAIL because current full-film URLs use GitHub Release assets and one ends in `.mov`.

- [ ] **Step 3: Implement build and verification scripts**

`workModel.js` reads `import.meta.env.VITE_MEDIA_ORIGIN` with production default `https://media.koujikeji.com` and builds `works/full/{id}-full.mp4` URLs. `scripts/verify-media.mjs` executes `ffprobe` for each file and throws unless video codec is `h264` and audio codec is `aac` when audio exists. `scripts/build-oss-site.mjs` runs Vite with `--base=/` and refuses a build whose HTML contains `/CreativeAgencyStyle/` or `github.com/yilingu979-web/CreativeAgencyStyle/releases`.

- [ ] **Step 4: Run verification**

Run: `node --test src/sections/workModel.test.js && node scripts/build-oss-site.mjs`

Expected: test passes and `dist/index.html` uses root-relative production asset paths.

- [ ] **Step 5: Commit**

```bash
git add src/sections/workModel.js src/sections/workModel.test.js scripts/build-oss-site.mjs scripts/verify-media.mjs
git commit -m "feat: prepare OSS-hosted mobile video delivery"
```

### Task 4: Configure and verify Alibaba Cloud deployment

**Files:**
- Create: `deployment/oss-upload-manifest.json`
- Create: `deployment/function-compute-contact.json`
- Create: `deployment/deployment.test.js`
- Modify: `README.md`

**Interfaces:**
- Consumes: `dist/`, four verified MP4s, Direct Mail sender, and Function Compute environment variables.
- Produces: HTTPS website at `https://koujikeji.com`, HTTPS media at `https://media.koujikeji.com`, and POST endpoint `https://api.koujikeji.com/contact`.

- [ ] **Step 1: Write the deployment manifest checks**

```js
assert.deepEqual(manifest.requiredObjects, [
  'index.html',
  'works/full/wuling-full.mp4',
  'works/full/swim-full.mp4',
  'works/full/princess-full.mp4',
  'works/full/summer-full.mp4',
]);
assert.equal(manifest.headers['Cache-Control'], 'public, max-age=31536000, immutable');
```

- [ ] **Step 2: Run the manifest test to verify failure**

Run: `node --test deployment/deployment.test.js`

Expected: FAIL because the manifest does not exist.

- [ ] **Step 3: Configure deployment and upload**

Create the Hong Kong OSS bucket `koujikeji-official-web` using standard storage and local redundancy. Enable static website hosting (`index.html` and `404.html`), public-read files, and HTTPS. Upload the Vite `dist/` tree and the four `ffprobe`-verified MP4s. Bind `koujikeji.com` to the website and `media.koujikeji.com` to the media path with matching DNS and certificates.

Create an HTTP Function Compute function for `api/contact.js` with Node.js 20. Give it a least-privilege RAM role containing only `dm:SingleSendMail`. Add only `DIRECT_MAIL_SENDER` as a private environment variable; the function role supplies temporary credentials at runtime. Bind `api.koujikeji.com/contact` and allow CORS only from `https://koujikeji.com`.

- [ ] **Step 4: Run production checks**

Run:

```bash
curl -fsSI https://koujikeji.com/
curl -fsSI https://media.koujikeji.com/works/full/wuling-full.mp4
curl -fsS -X POST https://api.koujikeji.com/contact -H 'Content-Type: application/json' --data '{"name":"Kouji delivery test","company":"Kouji","contact":"postmaster@koujikeji.com","projectDescription":"Production mail delivery verification.","website":""}'
```

Expected: two HTTP 200 responses; API returns `{ "ok": true }`; `postmaster@koujikeji.com` receives the complete test submission.

- [ ] **Step 5: Commit deployment documentation**

```bash
git add deployment README.md
git commit -m "docs: record OSS and contact endpoint deployment"
```
