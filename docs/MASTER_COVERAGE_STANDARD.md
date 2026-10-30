# CSE Prep Desk — Owner's All-in-One Preparation Standard

Updated: 2026-10-31. This document is a completion standard, **not a claim that the content is complete**.

## Product goal

A Bangladesh CSE/IT job candidate should be able to learn concepts, solve MCQs, write structured technical answers, practice coding/SQL, study genuine past papers, take timed tests and review weaknesses in one offline-capable workspace. The actual recruiting circular and official syllabus remain authoritative. There is no responsible guarantee of covering undisclosed future questions or changing current affairs.

## Exam scope

- CSE/ICT government and autonomous-body roles: Assistant Programmer, Programmer, ICT Officer, Assistant Engineer (CSE/IT), System/Network/Database roles.
- Bank IT/ICT, developer/practical and academic/lecturer CSE tracks.
- Advanced BUET-style *technical simulation* with independently written problems, not invented BUET papers or a claim about a particular official exam format.
- Technical MCQ, general MCQ, written, numerical, coding/SQL practical, viva and interview preparation. Each exam track is a configurable learning focus; never hard-code an unverified employer mark distribution.

## Subject coverage matrix

| Domain | Mandatory content depth | Exercise mix |
| --- | --- | --- |
| Programming (C/C++/Python/C#) | Control flow, memory, pointers, OOP, recursion, debugging, complexity | Output trace, write/debug code, edge cases |
| Data Structures | Array/list/stack/queue/hash/tree/heap/trie/graph | Operations, proofs, coding |
| Algorithms | Complexity, recurrences, sorting/searching, greedy, DP, graph, string | Trace, optimize, prove, implement |
| DBMS & SQL | ER/FD/normalization, joins, windows, indexes, concurrency, recovery | SQL queries, design, explain plans |
| Operating System | Scheduling, concurrency, deadlock, paging, file systems, process/thread | Gantt chart, page faults, written |
| Networking | OSI/TCP-IP, CIDR/VLSM, DNS, HTTP/TLS, routing/switching, security | Subnet calculations, troubleshooting |
| Digital Logic | Boolean/K-map, gates, combinational/sequential circuits, FSM | Simplification and circuit tracing |
| Computer Architecture | ISA, number systems, addressing, pipeline, cache, memory hierarchy | CPI/AMAT and binary numericals |
| Compiler Design | Lexing, regex/DFA, grammar, FIRST/FOLLOW, parsing, code generation | Parse table and token problems |
| Automata Theory | DFA/NFA, regex, CFG/PDA, pumping lemma, computability | Constructions and proofs |
| OOP & C# | Classes/interfaces, SOLID, collections, exceptions, async | Design and code review |
| Web & APIs | HTTP, REST, auth/authz, caching, concurrency, secure APIs | Implementation and debugging |
| Security | Cryptography fundamentals, SQLi/XSS/CSRF/IDOR, IAM, network security | Threat analysis, prevention |
| Software Engineering | SDLC, requirements, UML, testing, Git, architecture, performance | Design and written trade-offs |
| Linux & DevOps | Shell, permissions, processes, services, deployments, logging | Practical commands and diagnosis |
| Mathematics | Arithmetic, algebra, percentages, profit/loss, time/work, probability, statistics, discrete math | Timed calculations, proofs |
| English | Grammar, tense, agreement, voice, narration, prepositions, vocabulary, idioms, comprehension, writing | At least 1,500 distinct, reviewed MCQs |
| Bangla | ব্যাকরণ, সন্ধি-সমাস, কারক, বানান, শুদ্ধ বাক্য, শব্দার্থ, বাগধারা, সাহিত্য ও রচনা | At least 1,500 distinct, reviewed MCQs |
| General Knowledge | বাংলাদেশ, ইতিহাস, মুক্তিযুদ্ধ, সংবিধান, ভূগোল, অর্থনীতি, আন্তর্জাতিক, বিজ্ঞান, ICT, dated current affairs | At least 1,500 distinct, reviewed MCQs |

## Content integrity rules

1. The 1,500+ target for each of Bangla, English and GK means **distinct reviewed knowledge checks**, not the same fact with options permuted. New authored items require one unambiguous correct option, three plausible distinct distractors and a meaningful explanation in Bangla and/or English.
2. Preserve all existing question, chapter, written and practical IDs used by browser-local answers/bookmarks. Append, never reorder. Use separate stable IDs for future imports instead of regenerating sequential IDs from a sorted list.
3. Label provenance visibly and truthfully: `Original authored practice`, `Calculated variant`, `User-imported unverified`, `Source-verified past paper`. A question is never called a verified past paper without an authentic source and a rights/permission check.
4. A 10,000+ count achieved through parameterized numerical variants is useful for drill speed but **does not satisfy** the authored-concept breadth target.
5. For changing facts, store source publisher, source URL, `asOf` and review date. Do not silently present an old office holder, law, ranking or vacancy deadline as current.
6. Every new batch requires duplicate-prompt review, answer-key verification, negative-option checks, topic distribution review and unit tests. Human/editorial verification is still necessary for nuanced language and GK questions.

## Readiness gates

- **Learn:** At least one explained lesson and worked example for each subtopic in this matrix; downloadable/offline, searchable, and connected to relevant practice. The current 41 chapters are a foundation, **not full subtopic depth**.
- **Practice:** At least 1,500 independent Bangla, 1,500 English, and 1,500 GK questions; strong technical authored bank spanning every topic; calculate and report authored/variant/verified counts separately.
- **Written:** Broad original essay, short-answer, comparison, design and numerical practice; do not count 1,200 variations as 1,200 independently researched essay answers.
- **Practical:** Actual source-code/SQL tasks with test inputs, edge cases, solutions and rubric. The current 400 cases include parameterized variations and are not 400 unique coding assignments.
- **Previous papers:** Authentic source-backed papers with year, organization, role, exam type, provenance and verified answers where available. Empty archive or user import feature is not considered completion.
- **Mock:** Multiple track-aligned timed exams, accurate marking/penalty, answer review, history, topic-level diagnosis, balancing without repetitive variants. Mock simulations must not claim an official employer paper pattern.
- **Career:** Automatic daily discovery runs and creates dated, deduplicated leads; official circulars and deadlines are verified separately. Monitor recurring failures and preserve the last good feed.
- **Safety:** Browser-local data remains private/offline; export/restore works; cache/version upgrades do not erase history; mobile accessibility and performance smoke tests pass.

## Current code baseline (2026-10-31)

- Repository content: 16,641 MCQ practice cases = 1,751 original authored questions, 3,255 structured recall variations and 11,635 numerical/drill variants. Added 120 independently phrased technical questions, eight per CSE subject; legacy question identifiers remain unchanged.
- General subject counts: Bangla 1,539, English 1,545, General Knowledge 1,508 **total practice cases**. Authored independent concept/fact subsets are only 441, 446 and 450; the rest are structured variations. The **independent 1,500-per-subject target remains unmet**.
- 41 study chapters with original worked notes and recall; 1,353 written cases (20 added detailed technical solutions); 420 practical cases (20 added original worked exercises); 8 tracks.
- Previous-paper archive functionality exists, but no independently authenticated paper bundled.
- GitHub Actions daily-circular workflow was manually triggered successfully once; ongoing scheduled-run reliability not yet proven.

The new batch includes tests for distinct options, unique question wording, bilingual explanations, all 15 technical subjects, written/practical rubrics and historical ID stability. Automated checks do not substitute for subject-matter editorial review or the official recruiting agency's current syllabus.

## Implementation order

1. Deepen concept lessons by subtopic, worked derivations/diagrams, solved SQL and code; test on mobile/offline.
2. Expand Bangla, English and GK **with distinct reviewed concepts** to 1,500+ each in balanced subtopics. Validate and preserve IDs in small incremental batches.
3. Expand original CSE written and practical problems, including model solutions and edge-case tests; explicitly separate variants.
4. Populate authentic historical papers only from legally usable, verified sources; improve exam-specific filters and source audit.
5. Run question-bank audit, cross-track mocks, browser data migration, scheduled circular monitoring and full regression QA before making a broad completion claim.

**Do not mark this mission 100% complete based on raw item totals, a successful build or an attractive UI.**
