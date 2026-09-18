# About and Contact Completion Design

## Goal

Complete the localized About and Contact/Footer sections without changing the existing Hero, Work section, design language, animations, or responsive behavior, and add a real Vercel-compatible email submission path.

## Existing State and Constraints

- The implementation starts from `origin/main` commit `7a80f71`.
- `src/sections/Hero.jsx` already contains “扣寂 / 创造 / 影像 / 未来” and must remain unchanged.
- About keeps its current two-column layout, typography scale, spacing, grayscale hover, GSAP reveal, parallax behavior, button, and responsive structure.
- Footer keeps the original black background, typography, spacing, hover/cursor behavior, and responsive visual language.
- The supplied church image is resized and encoded as a web-optimized JPEG in `public/assets/` without changing its composition.
- Secrets must never be committed.

## About Section

Replace only the image and copy in `src/sections/About.jsx`:

- Image: supplied church photograph.
- Heading: `我们重新想象影像。`
- Body: `我们聚集了一群对影像充满热情的创作者和技术探索者，用 AI 拓展影像创作的可能，让想象成为一种真实可见的体验。`
- Keep `MORE ABOUT US` unchanged.
- Preserve all existing refs, GSAP timelines, classes, structure, and interaction behavior except the content-specific image `src` and `alt`.

## Contact/Footer Section

Update `src/sections/Footer.jsx` while preserving the template aesthetic. The left column contains:

- Large heading: `联系我们`
- Smaller single-line heading: `LET'S CREATE.`
- `Koujikeji.com`
- `postmaster@koujikeji.com`

The right column contains a controlled React form with these fields in order:

1. `name`, placeholder `怎么称呼你？`
2. `company`, placeholder `你的品牌或公司`
3. `contact`, placeholder `邮箱或微信`
4. `projectDescription`, textarea placeholder `你想让我们一起创造什么？`

The submit button reads `与扣寂开启创作 ↗`. During submission it is disabled and displays a loading state. The success message is shown only after the API confirms delivery: `已收到，我们会尽快与你联系。` Failures show a retryable error message.

Remove all original copyright, policy, social, email, telephone, and empty-link content completely.

## Email Architecture

Add a Vercel function at `api/contact.js`, with private validation and tests outside the routable `api/` directory under `server/`. The frontend sends JSON to `/api/contact`. The function:

- accepts only `POST`;
- validates content type and the fields `name`, `company`, `contact`, and `projectDescription`;
- trims values and enforces sensible minimum and maximum lengths;
- rejects a filled hidden honeypot field;
- rejects rapid duplicate submissions using a deterministic payload fingerprint and a short-lived in-memory cache (best-effort within a serverless instance);
- sends an email through the Resend HTTPS API to `postmaster@koujikeji.com`;
- includes `name`, `company`, `contact`, `projectDescription`, and server-generated `submittedAt`;
- returns success only when Resend confirms acceptance;
- never exposes credentials or internal provider errors to the browser.

Resend is the recommended provider because it requires one server-side API key, works in Vercel functions without SMTP socket configuration, and keeps the dependency surface small. Direct SMTP is rejected because it adds transport and credential complexity; a separate backend service is rejected because it is unnecessary for this site.

Required environment variables:

- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL` (a sender address on a domain verified in Resend)

Add `.env.example` with non-secret placeholders and document Vercel/Resend setup in the README. Without real credentials, validate through the provider boundary but do not claim that a real message was delivered.

## Validation and Spam Controls

Frontend required fields and length limits improve immediate feedback. The server independently enforces the same rules. The honeypot is visually hidden and excluded from normal keyboard navigation. A short duplicate window blocks accidental double submission while the loading state disables the button. The API rejects oversized or malformed JSON and non-POST methods.

## Testing and Verification

Add automated tests for pure request validation and message construction before implementing those functions. Test valid input, missing/oversized values, honeypot rejection, and normalized email contents. Verify the frontend API states with focused component/request tests if the existing toolchain supports them without disproportionate setup; otherwise verify the UI through a production build and browser inspection.

Before pushing:

- run the complete test suite;
- run `npm run lint`;
- run `npm run build`;
- inspect the final diff to confirm `src/sections/Hero.jsx` and unrelated middle sections are unchanged;
- inspect desktop and mobile layouts for visible overflow;
- test the API to the credential boundary and clearly report that live delivery still requires the two environment variables;
- commit only scoped files and push the resulting commits to `origin/main`.
