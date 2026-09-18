# About and Contact Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the localized About section, redesigned-in-place Contact/Footer form, and real Vercel email submission path on the existing localized homepage.

**Architecture:** Preserve the existing React/GSAP section structures and add a controlled contact form that posts to a Vercel function. Keep validation and email composition in a small pure server module tested with Node's built-in test runner, while the route owns HTTP parsing, duplicate throttling, and the Resend boundary.

**Tech Stack:** React 19, Vite 7, Tailwind CSS 4, GSAP, Vercel Functions, Resend HTTPS API, Node test runner.

**Spec:** `docs/superpowers/specs/2026-08-23-about-contact-design.md`

## Global Constraints

- Start from `origin/main` commit `7a80f71` and leave `src/sections/Hero.jsx`, `src/sections/Work.jsx`, and other middle sections unchanged.
- Preserve the current About layout, styling, animation, button, and responsive logic.
- Preserve the Footer's black background and existing visual language while removing all obsolete content.
- Never commit credentials; live delivery requires `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` in Vercel.
- Show frontend success only after the backend confirms Resend acceptance.

---

### Task 1: Contact payload contract and email content

**Files:**
- Create: `server/contact.js`
- Create: `server/contact.test.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `validateContactPayload(value)` returning `{ ok: true, data }` or `{ ok: false, error }`; `buildContactEmail(data, submittedAt)` returning `{ subject, text, html }`; `payloadFingerprint(data)` returning a stable string.

- [ ] **Step 1: Add failing tests for valid normalization and invalid input**

Use Node's test runner to assert trimming, required fields, field length limits, honeypot rejection, and stable fingerprints. Keep this private module outside Vercel's routable `api/` directory. A production change that drops a required check, accepts spam, or stops normalizing must fail these tests.

- [ ] **Step 2: Run `node --test api/lib/contact.test.js` and verify failure because the module does not exist**

- [ ] **Step 3: Implement minimal pure validation, email construction, HTML escaping, and fingerprint logic**

Set exact limits: name 1–80, company 1–120, contact 3–160, projectDescription 10–3000; reject non-string fields and a non-empty `website` honeypot. Include all required values and `submittedAt` in text and escaped HTML.

- [ ] **Step 4: Run `node --test api/lib/contact.test.js` and verify all tests pass**

- [ ] **Step 5: Add `"test": "node --test"` to package scripts and commit the contract files**

### Task 2: Vercel contact endpoint and Resend boundary

**Files:**
- Create: `api/contact.js`
- Modify: `server/contact.test.js`
- Create: `.env.example`

**Interfaces:**
- Consumes: `validateContactPayload`, `buildContactEmail`, and `payloadFingerprint` from Task 1.
- Produces: default Vercel handler for `POST /api/contact`; `sendContactEmail` and `createContactHandler` exports for direct boundary testing.

- [ ] **Step 1: Add failing handler tests**

Cover method rejection, invalid body, missing credentials, provider success, provider failure, and rapid duplicate rejection. Use a specific injected fetch double only for the external Resend HTTP request; assertions target handler status/body and the real request payload.

- [ ] **Step 2: Run the endpoint tests and verify expected failures because the route does not exist**

- [ ] **Step 3: Implement the minimal handler**

Accept only JSON POST requests, limit serialized body size to 16 KB, validate server-side, check `RESEND_API_KEY` and `CONTACT_FROM_EMAIL`, throttle identical payloads for 60 seconds in a bounded in-memory map, call `https://api.resend.com/emails`, and return generic retryable errors without leaking secrets.

- [ ] **Step 4: Run all tests and verify pass**

- [ ] **Step 5: Add secret-free `.env.example` placeholders and commit the endpoint**

### Task 3: About localization and church asset

**Files:**
- Create: `public/assets/kouji-church.jpg`
- Modify: `src/sections/About.jsx`

**Interfaces:**
- Consumes: the supplied church image.
- Produces: unchanged About component structure with localized content and local image reference.

- [ ] **Step 1: Resize and encode the supplied church image as `public/assets/kouji-church.jpg` without changing its composition**

- [ ] **Step 2: Replace only About image metadata, title, and body copy**

Keep every existing GSAP setup, ref, layout wrapper, class string, and `MORE ABOUT US` button unchanged.

- [ ] **Step 3: Run lint and build to catch JSX and asset failures**

- [ ] **Step 4: Inspect the diff to confirm the About changes are content-only and commit them**

### Task 4: Contact/Footer form UI

**Files:**
- Modify: `src/sections/Footer.jsx`

**Interfaces:**
- Consumes: `POST /api/contact` with `{ name, company, contact, projectDescription, website }`.
- Produces: controlled form with idle, loading, success, and retryable error states.

- [ ] **Step 1: Implement the controlled form and submission state**

Use native `required`, `minLength`, and `maxLength` attributes matching the server contract. Send JSON, disable during submission, clear only after success, and retain values on failure.

- [ ] **Step 2: Implement the in-template responsive styling**

Keep `bg-primary text-secondary`, font families, borders, accent hover, cursor data attributes, and responsive stacking. Put contact information directly below the two headings and render the honeypot off-screen and outside keyboard order.

- [ ] **Step 3: Remove all original social, policy, copyright, telephone, old email, and empty-link markup**

- [ ] **Step 4: Run lint and build, then inspect desktop and mobile layouts for overflow**

- [ ] **Step 5: Commit the Footer UI**

### Task 5: Setup documentation, integrated verification, and delivery

**Files:**
- Modify: `README.md`

**Interfaces:**
- Documents: Resend domain verification, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, local environment setup, and Vercel configuration.

- [ ] **Step 1: Document the email setup and credential boundary**

- [ ] **Step 2: Run fresh `npm test`, `npm run lint`, and `npm run build`**

- [ ] **Step 3: Inspect `git diff origin/main...HEAD` and verify Hero/middle sections are untouched**

- [ ] **Step 4: Start the production preview, test desktop/mobile rendering, and exercise API success/failure behavior to the credential boundary**

- [ ] **Step 5: Stage only scoped files, create the final documentation/verification commit, and push all commits to `origin/main`**

- [ ] **Step 6: Open the latest local Demo and report files, commit hash, push status, tests/build, email architecture, and remaining Vercel/Resend environment configuration**
