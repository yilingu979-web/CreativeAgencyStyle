# Creative Agency

Agency site with big-type motion and animated case grids.

🔗 **Live demo:** https://creative-agency-style.vercel.app/

## Built with
`React` · `Framer Motion` · `Tailwind CSS` · `Vite`

## Features
- Production-ready MERN / React architecture
- Responsive, accessible UI (mobile-first)
- Deployed on Vercel with CI

## Contact form email delivery

The contact form posts to the Vercel Function at `/api/contact`. The function validates the request and sends a Chinese project-enquiry email to `postmaster@koujikeji.com` through Resend. A success response is returned only after Resend confirms the email request.

Configure these Vercel Environment Variables for Production and Preview:

- `RESEND_API_KEY`: create an API key in the Resend dashboard.
- `CONTACT_FROM_EMAIL`: a sender on a domain verified in Resend, for example `Kouji Website <contact@koujikeji.com>`.

Copy `.env.example` for local configuration, but never commit the real values. After deployment, submit the website form once and confirm both the success message and the new message in `postmaster@koujikeji.com` (or check the matching delivery event in Resend).

## About
Built by [Navaneeth KV (Navi)](https://github.com/Navaneeth223) — MERN full-stack developer.
More: [github.com/Navaneeth223](https://github.com/Navaneeth223)

## License
MIT
