# CSE Prep Desk

Personal, fully static, offline-capable PWA for **Bangladesh CSE/IT government job circulars and exam preparation**. One user, no login, no payments, no server, no database, no R2.


## Included

- Verified-source circular snapshots for Petrobangla, BCIC and BPATC with automatic expiry display, plus a separate **automated daily discovery** section for unverified CSE/IT job leads.
- Search/filter circulars; save application status (Saved, Applied, Exam prep); add your own official HTTPS circulars.
- **501 original MCQ questions** over **19 subjects**, including algorithm/data-structure, DBMS, OS, networking, compiler, architecture, digital logic, automata, security, C#, APIs, language/GK and quantitative drills.
- Instant correct-answer feedback with English and Bangla explanations; bookmarks, wrong-answer retry, unseen-question filter.
- **51 written practice questions** with sample answers and studied status.
- Four-week BUET-style study roadmap and previous-question reference (historical example, not a guaranteed 2026 pattern).
- Timed mock exams with 10/20/40/50/100 random questions, technical/general selection, saved progress, results, explanations, and history.
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

## Daily automatic CSE circular discovery (no paid services)

The GitHub Actions workflow [`.github/workflows/daily-circulars.yml`](.github/workflows/daily-circulars.yml) runs around **07:17 Bangladesh time** daily, using public Google News RSS search queries. It needs **no API keys, external databases, payment card, or Cloudflare R2**. The workflow:

1. Searches six public RSS queries about CSE/IT recruitment in Bangladesh (Bengali and English).
2. Excludes obviously irrelevant headlines and old entries; deduplicates relevant candidates, retaining up to 75 recent links.
3. Rebuilds the static `public/data/discovered.js` module with the latest successful check time. If every feed fails, the job exits unsuccessfully **without deleting** previously found links.
4. Validates the site, commits the changes to `main` using the repository's `GITHUB_TOKEN`, and triggers the connected Cloudflare Pages deployment.

**Important:** The automatic entries are *search-index leads*, **not verified official job circulars**. They have **no asserted vacancy count, deadline, eligibility, or direct application link** because those facts cannot be reliably inferred from headlines. Follow the link and verify the original recruiting organization's official PDF. The existing independently verified listings remain separate. Some jobs might be missed by RSS or not published in a timely manner. Daily checks are best effort; GitHub Actions schedules can be delayed, disabled in long-inactive public repositories, or restricted by repository settings.

**One-time activation after the first push:** On GitHub, go to **Actions → Daily CSE circular discovery → Run workflow → main → Run workflow** to populate the next batch immediately. If GitHub asks to enable Actions, enable it for this repository. In **Settings → Actions → General → Workflow permissions**, the workflow must have permission to write repository contents; some repositories default to read-only. Cloudflare Pages must use Git integration with production branch `main` and **Build output `public`**, not the repository root. Under Git-integrated Pages, new commits automatically start deployments.

GitHub Free is intended for public-repository workflow usage; always check GitHub's current policies/limits. No guarantee is made of uninterrupted daily runs or of capturing every vacancy.

## Verified circulars and personal tracking

The bundled jobs in `public/data/jobs.js` are a *manual snapshot checked on 2026-10-30*, **not an automatically verified feed**. Their status changes to expired automatically after the deadline. The daily RSS discovery feed is a separate, explicitly unverified panel. Always confirm details from the original official circular PDF.

- For a new official listing available only to you, click **+ সার্কুলার যোগ করুন** on the app. This item is saved locally to the current browser, not to GitHub.
- For a listing that should appear on all your devices, edit `public/data/jobs.js`, update `JOBS_LAST_CHECKED` only after source verification, and push to GitHub.
- To refresh question content, update `public/data/questions.js`, `public/data/advanced.js` or `public/data/drills.js` and deploy. Online requests revalidate cached assets; bump the `VERSION` string in `public/sw.js` for substantial releases so old caches are cleaned.

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

This is a study aid, not an affiliated official government service. Exam pattern and marks can change; this question bank is original practice content, **not official past questions or guaranteed exam suggestions**. The 501 MCQs include deterministic computational drills: they increase practice volume but do not replace textbooks, verified past papers or a complete syllabus.
