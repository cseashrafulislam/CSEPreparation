# CSE Prep Desk

Personal, fully static, offline-capable PWA for **Bangladesh CSE/IT government job circulars and exam preparation**. One user, no login, no payments, no server, no database, no R2.


## Included

- Verified-source circular snapshots for Petrobangla, BCIC and BPATC with automatic expiry display.
- Search/filter circulars; save application status (Saved, Applied, Exam prep); add your own official HTTPS circulars.
- Topic-wise MCQ question bank covering CSE technical subjects, mathematics, English, Bangla and general knowledge.
- Instant correct-answer feedback with English and Bangla explanations; bookmarks, wrong-answer retry, unseen-question filter.
- Technical and general written practice questions, sample answers, and studied status.
- Four-week BUET-style study roadmap and previous-question reference (historical example, not a guaranteed 2026 pattern).
- Timed mock exam with 10/20/40 random questions, technical/general selection, saved progress, results, explanations, and history.
- Personal study notes, daily goal, JSON export/restore, light/dark mode, responsive layout.
- Installable PWA with a service worker: the app and built-in question bank work offline after the first load.

## Publish for free using Cloudflare Pages

This project intentionally needs **zero Cloudflare paid products**. It deploys using static assets and works on a free `*.pages.dev` subdomain.

1. Create a free Cloudflare account and open **Workers & Pages → Create application → Pages → Import an existing Git repository**.
2. Connect GitHub and choose `cseashrafulislam/CSEPreparation`.
3. Choose production branch **main**.
4. Configure:

   | Setting | Value |
   | --- | --- |
   | Framework preset | None |
| Build command | `node scripts/build.mjs` |
   | Build output directory | `public` |
   | Root directory | Leave empty / repository root |

5. Select **Save and Deploy**. Cloudflare provides an HTTPS `*.pages.dev` address. Future pushes to `main` automatically deploy.
6. Open the HTTPS site in Chrome/Edge and select **Install App**. On iPhone/iPad use Safari Share → **Add to Home Screen**.

No payment card, R2, D1, KV, Worker API, external fonts, npm install or domain purchase are required for this version. The only build step generates the PWA's 192px and 512px PNG icons with Node.js built-in modules; Cloudflare Pages provides Node.js in its build environment. Cloudflare could change its signup requirements or Free-plan limits; check the current dashboard.

Cloudflare references: [Static HTML deploy](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/) · [Free plan limits](https://developers.cloudflare.com/pages/platform/limits/).

## Updating circulars

The bundled jobs in `public/data/jobs.js` are a *manual snapshot checked on 2026-10-30*, **not a live automated feed**. Their status changes to expired automatically after the deadline. Always confirm details from the original official circular PDF.

- For a new official listing available only to you, click **+ সার্কুলার যোগ করুন** on the app. This item is saved locally to the current browser, not to GitHub.
- For a listing that should appear on all your devices, edit `public/data/jobs.js`, update `JOBS_LAST_CHECKED` only after source verification, and push to GitHub.
- To refresh question content, update `public/data/questions.js` and deploy. Online requests revalidate cached assets; bump the `VERSION` string in `public/sw.js` for substantial releases so old caches are cleaned.

## Privacy and backups

There is **no authentication**: anyone who knows the public Pages URL can view the bundled questions and circulars. Do not put private credentials, photos, or personal details in the GitHub repository. Your practice answers, status, notes and custom circulars stay in your own browser's localStorage, not in Cloudflare databases. A different browser/device has separate progress. Export and restore JSON under **Notes & Backup** to transfer your work. Clearing site data can delete local progress. The downloaded JSON backup may contain personal notes—store it privately.

## Development

```bash
npm test
npm run check
npm run build
python3 -m http.server 8000 --directory public
```

Visit `http://localhost:8000`. No `npm install` is required. All browser files live in `public/`; source tests live in `tests/`.

This is a study aid, not an affiliated official government service. Exam pattern and marks can change; this question bank is original practice content, **not official past questions or guaranteed exam suggestions**.
