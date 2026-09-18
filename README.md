# Creative Agency

Agency site with big-type motion and animated case grids.

🔗 **Live demo:** https://creative-agency-style.vercel.app/

## Built with
`React` · `Framer Motion` · `Tailwind CSS` · `Vite`

## Features
- Production-ready MERN / React architecture
- Responsive, accessible UI (mobile-first)
- Deployed on Vercel with CI

## Contact form email setup

The contact form posts to the Vercel Function at `/api/contact`, which validates the submission and sends it to `postmaster@koujikeji.com` through the Resend API. The browser displays success only after Resend accepts the email.

1. Add and verify a sending domain in [Resend](https://resend.com/domains).
2. Create a Resend API key.
3. Copy `.env.example` to `.env.local` for local Vercel development, or add the variables in the Vercel project's Environment Variables settings:

```env
RESEND_API_KEY=re_your_api_key
CONTACT_FROM_EMAIL=Kouji Website <contact@your-verified-domain.example>
```

`CONTACT_FROM_EMAIL` must use an address on the verified sending domain. Do not commit `.env.local`, API keys, or provider credentials. After adding or changing Vercel variables, redeploy the project so the Function receives them.

## About
Built by [Navaneeth KV (Navi)](https://github.com/Navaneeth223) — MERN full-stack developer.
More: [github.com/Navaneeth223](https://github.com/Navaneeth223)

## License
MIT
