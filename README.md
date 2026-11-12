# CSE Prep Desk

Personal, fully static, offline-capable PWA for **Bangladesh CSE/IT government job circulars and exam preparation**. One user, no login, no payments, no server, no database, no R2.

Development completion criteria for the owner's complete CSE/IT preparation goal: [Master Coverage Standard](docs/MASTER_COVERAGE_STANDARD.md). The current content does **not** yet meet all those gates.


## Included

- Position-specific, official-source job circulars for **all CSE/BSc Engineering-eligible posts (even 1 vacancy)** and **any-subject four-year Honours/equivalent posts only when that specific position has 30+ vacancies**; Petrobangla, BPSC, Bangladesh Post, BCIC and BPATC are included in the 2026-11-12 snapshot. Expired vacancies are hidden by default, while unverified daily news leads appear in a separate section.
- Search/filter circulars; save application status (Saved, Applied, Exam prep); add your own official HTTPS circulars.
- **16,641 MCQ practice prompts** over **19 subjects**, including **1,751 authored original concept/word/grammar/fact questions**, **3,255 structured vocabulary/fact recall variations** and **11,635 parameterized numerical drill variants**. The latest content release adds **120 independent technical MCQs** (eight each across 15 CSE subjects) with four choices, English/Bangla reasoning and chapter tags. The 9,900 numerical cases are built from **30 worked scenario families** with deterministic answers and explanatory steps. Variants build recall and calculation speed; they **must not** be counted as separate independently researched facts or official past papers.
- **Bangla: 1,539**, **English: 1,545**, **General Knowledge: 1,508** practice items. Their **independently authored fact/concept** subsets are 441, 446 and 450 respectively; the remainder are transparent reverse-recall, matching and related practice variants. All questions have four choices and English/Bangla explanations. Subtopic filters cover Bangla vocabulary/idioms, English vocabulary/grammar, Bangladesh history and institutions, world country/capital/ISO facts, and general science/elements. These are **not authenticated BUET/BCS/agency papers**; historical and stable reference facts are preferred over current office-holder and disputed-capital claims.
- Instant correct-answer feedback with English and Bangla explanations; bookmarks, wrong-answer retry, unseen-question filter.
- **41 topic-based study chapters** across all 19 subjects: concepts, checklists, original worked examples, exam rules, common pitfalls, written exercises and an answer-hidden active-recall question. Search lessons by keyword, choose one of 8 tracks, mark studied chapters, and open related MCQs. The additional 15 chapters focus on Bangla grammar/literature, English grammar/vocabulary, Bangladesh/world/science GK, quantitative reasoning, advanced CSE SQL/coding, OS numericals and VLSM. These are original concise learning notes, **not comprehensive textbooks or official recruiting-agency curricula**.
- **420 offline practical problems**: 60 original tasks (40 earlier plus 20 new worked coding, SQL and technical cases) and 360 parameterized coding, SQL and analytical case studies with sample outputs, reference algorithms, edge-case checklists, rubrics, saved drafts and revision status. Code/SQL is not executed or auto-graded by this app.
- **1,353 written practice tasks**: 71 original authored/model-answer prompts (51 earlier plus 20 new detailed technical answers), 82 topic synthesis/design tasks and 1,200 worked numerical written scenarios. This is a mix of essays, designs and calculations, **not 1,353 independently sourced essay papers**. Draft your own solution, then compare the worked answer and rubric.
- **Previous Paper Archive** with strict source-URL-backed JSON import, original exam metadata, optional answer review, local search and progress. **No independently authenticated historical question paper is bundled**: import genuine paper questions you are permitted to use after checking the recruiting agency's source; the app always labels these user-provided records as unverified.
- **8 selectable study/exam tracks**, including all-round, technical written, bank IT, developer practical, BUET-style technical *simulation*, government assistant programmer/ICT, network/system administrator and academic CSE. These are focus settings, not official employer-issued paper patterns.
- **Eight-week flexible study roadmap** and a clearly labeled third-party historical previous-question reference (not a guaranteed current BUET/employer exam pattern).
- Timed mocks with 10/20/50/100/200 selected questions, exam-track and authored/numerical filters, topic-balanced selection, optional 0/0.25/0.5 wrong-answer deduction, saved progress, **post-exam subject-level correct/wrong/skipped/accuracy**, reviewed results and history.
- **Spaced review** after correct/wrong MCQ attempts, due-question practice, per-topic answer accuracy/coverage, weak-topic recommendations and recent-activity graph.
- Personal study notes, daily goal, JSON export/restore (including user-imported previous papers), paginated large question lists, light/dark mode, responsive layout.
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

The bundled jobs in `public/data/jobs.js` are a *manual snapshot checked on 2026-11-12*, **not an automatically verified feed**. Each listing represents an **individual eligible position**, never the total openings of a mixed-role advertisement. The **BSc CSE/Engineering** filter includes all verified eligible positions regardless of seat count; the **General Honours (30+)** filter includes positions open to any-subject four-year Honours/equivalent degree holders only when **that position itself has at least 30 posts**. The All tab combines both. Bangladesh-local cutoff times are used when published, and expired positions are hidden by default but remain available via the Expired toggle. The BPSC Sub-Registrar seat count differs between source copies (48 versus 84); the item is explicitly flagged for re-verification rather than claiming one figure is certain. The daily RSS discovery feed is separate and *unverified*, so its leads cannot be auto-classified as eligible or as 30+ vacancies without official PDF checks. Always verify education, experience, age and exact vacancy count in the official circular.

- For a new official listing available only to you, click **+ সার্কুলার যোগ করুন** on the app. This item is saved locally to the current browser, not to GitHub.
- For a listing that should appear on all your devices, edit `public/data/jobs.js`, update `JOBS_LAST_CHECKED` only after source verification, and push to GitHub.
- To refresh content, edit the authored rows in `public/data/questions.js`, `public/data/advanced.js`, `public/data/exam-rows.js` or `public/data/general-prep.js`. The expanded vocabulary concepts live in `public/data/general-lexicon.js`; country and periodic-table reference facts in `public/data/reference-facts.js`; their multiple-direction recall forms in `public/data/general-extended.js`. External data notices: [`THIRD_PARTY_DATA_NOTICES.md`](THIRD_PARTY_DATA_NOTICES.md). **Review factual answers, spellings, current geographical details and potentially ambiguous distractors editorially.** Numeric drills live in `public/data/drills.js`, `public/data/numerical-scenarios.js` and `public/data/mega-bank.js`. Written additions are in `public/data/expanded-writing.js`, Lab cases in `public/data/expanded-labs.js`, and Academy chapters in `public/data/curriculum.js` with worked notes keyed by unit ID in `public/data/master-notes.js`. **Append new questions and chapters** to preserve existing IDs and study progress. Online requests revalidate cached assets; bump the `VERSION` in `public/sw.js` for substantial releases so old caches are cleaned.

## Privacy and backups

There is **no authentication**: anyone who knows the public Pages URL can view the bundled questions and circulars. Do not put private credentials, photos, or personal details in the GitHub repository. Your MCQ/review progress, written drafts, lab drafts, previous paper imports, statuses, notes and custom circulars stay in your own browser's localStorage, not in Cloudflare databases. A different browser/device has separate progress. Export and restore JSON under **Notes & Backup** to transfer your work. Clearing site data can delete local progress. The downloaded JSON backup may contain personal notes—store it privately. Browser localStorage is quota-limited; back up periodically, especially after importing a large paper archive.

## Development

```bash
npm test
npm run check
npm run build
python3 -m http.server 8000 --directory public
```

Visit `http://localhost:8000`. No `npm install` is required. All browser files live in `public/`; source tests live in `tests/`.

This is a study aid, not an affiliated official government service. Exam pattern and marks can change; this question bank is original practice content, **not official past questions or guaranteed exam suggestions**. Numerical variants deliberately increase repeat practice volume; they must not be mistaken for independently researched concepts or proof of examination readiness. The 41-chapter Academy now adds worked answers and active recall, but it is **not a complete replacement for full textbooks, verified past papers or the exact recruiting agency's syllabus**. The application has more than 10,000 valid *practice cases* but **does not claim 10,000 hand-written, independent, exam-authenticated MCQs**. Genuine previous papers must be legally sourced and individually verified before they can be counted as authenticated historical content.
