import { STORAGE_KEY, loadState, saveState, normalizeState, bangladeshToday, daysRemaining, jobPhase, escapeHtml as h, safeHttps, validateCustomJob, dailyPracticeCount } from "./core.js";
import { officialJobs, JOBS_LAST_CHECKED, sourceLinks } from "./data/jobs.js";
import { DISCOVERY_ITEMS, DISCOVERY_LAST_RUN, DISCOVERY_FEEDS_OK } from "./data/discovered.js";
import { questions, writtenQuestions, topics } from "./data/questions.js";
import { EXAM_TRACKS, UNITS, UNIT_BY_ID, trackTopics } from "./data/curriculum.js";
import { LABS, LAB_KINDS } from "./data/labs.js";
import { nextReview, dueQuestionIds, topicAnalytics, recommendedTopics, createBalancedMock, scoreWithPenalty, mockTopicBreakdown } from "./preparation-core.js";
import { mergePrevious, PREVIOUS_TEMPLATE } from "./previous-core.js";

const questionsById = new Map(questions.map(q => [q.id, q]));
const labsById = new Map(LABS.map(lab => [lab.id, lab]));
const topicTotals = new Map(topics.map(topic => [topic, questions.filter(q => q.topic === topic).length]));

let state = loadState();
const ui = {
  jobSearch: "", jobSector: "All", jobStatus: "All", showExpired: false,
  practiceTopic: "All", practiceSubtopic: "All", practiceMode: "All", practiceIndex: 0, practiceDifficulty: "All", practiceSearch: "",
  practiceSource: "All", writtenTopic: "All", writtenSearch: "", writtenPage: 0, expandedWritten: new Set(),
  academyTopic: "All", academyOpen: null,
  labKind: "All", labLevel: "All", labSearch: "", labPage: 0, labId: LABS[0]?.id, labHint: false, labSolution: false,
  previousSearch: "", previousType: "All", previousPage: 0,
  mockReviewId: null, mockTrack: state.trackId, installPrompt: null
};
let timerHandle = null;
let toastHandle = null;
const routes = new Set(["dashboard", "circulars", "academy", "practice", "lab", "written", "previous", "syllabus", "mock", "analytics", "notes"]);
const routeNames = {
  dashboard: "ড্যাশবোর্ড", circulars: "চাকরির সার্কুলার", practice: "MCQ প্র্যাকটিস",
  academy: "বিষয়ভিত্তিক পড়াশোনা", lab: "Coding & SQL Lab", analytics: "অগ্রগতি ও দুর্বলতা",
  written: "Written প্রস্তুতি", previous: "বিগত পরীক্ষার আর্কাইভ", syllabus: "পরীক্ষার রোডম্যাপ", mock: "মডেল টেস্ট", notes: "নোট ও ব্যাকআপ"
};
const byId = id => document.getElementById(id);
const labelDate = iso => new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" }).format(new Date(`${iso}T00:00:00Z`));
const percent = (a, b) => b > 0 ? Math.round(a * 100 / b) : 0;
const save = () => { if (!saveState(state)) toast("স্টোরেজে সেভ হয়নি। এখনই ব্যাকআপ নিয়ে রাখুন।"); };
const notice = count => count === 1 ? "১টি" : `${count}টি`;

function toast(message) {
  const element = byId("toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toastHandle);
  toastHandle = setTimeout(() => element.classList.remove("show"), 3800);
}

function route() {
  const value = location.hash.replace(/^#/, "") || "dashboard";
  return routes.has(value) ? value : "dashboard";
}

function go(target) {
  if (route() === target) render();
  else location.hash = target;
  document.querySelector(".sidebar")?.classList.remove("open");
  byId("sidebar-backdrop")?.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function applyTheme() {
  document.body.classList.toggle("dark", state.theme === "dark");
  byId("theme-icon").textContent = state.theme === "dark" ? "☀" : "☾";
  document.querySelector('meta[name="theme-color"]').content = state.theme === "dark" ? "#101928" : "#17283d";
}

function section(title, subtitle, actions = "") {
  return `<div class="page-heading"><div><div class="eyebrow">MY PERSONAL WORKSPACE</div><h1>${title}</h1><p>${subtitle}</p></div>${actions ? `<div class="heading-actions">${actions}</div>` : ""}</div>`;
}

function stat(label, value, icon, detail, tone = "") {
  return `<article class="stat ${tone}"><div class="stat-head"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-foot">${detail}</div></article>`;
}

function allJobs() {
  return [...officialJobs, ...state.customJobs].sort((a, b) => (a.deadline || "").localeCompare(b.deadline || ""));
}

function jobBadge(job) {
  const phase = jobPhase(job);
  const days = daysRemaining(job.deadline);
  if (phase === "closed") return '<span class="badge closed">● শেষ হয়েছে</span>';
  if (phase === "upcoming") return '<span class="badge">● শিগগির শুরু</span>';
  if (phase === "urgent") return `<span class="badge urgent">● আর ${days === 0 ? "আজই" : `${days} দিন`}</span>`;
  if (phase === "open") return `<span class="badge open">● ${days} দিন বাকি</span>`;
  return '<span class="badge">তারিখ যাচাই করুন</span>';
}

function jobLogo(job) {
  const name = job.organization.toLowerCase();
  const tone = name.includes("bcic") ? "bcic" : name.includes("bpatc") ? "bpatc" : "";
  const label = job.organization.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2) || "IT";
  return `<span class="job-logo ${tone}">${h(label)}</span>`;
}

function miniJob(job) {
  return `<a href="#circulars" class="mini-job">
    ${jobLogo(job)}
    <span class="mini-job-body"><strong>${h(job.title)}</strong><small>${h(job.organization)} · ${labelDate(job.deadline)}</small></span>
    <span class="mini-job-right">${jobBadge(job)}</span>
  </a>`;
}

function renderDashboard() {
  const today = bangladeshToday();
  const answered = Object.entries(state.answers).filter(([key]) => questionsById.has(key));
  const right = answered.filter(([, a]) => a.correct).length;
  const todayCount = dailyPracticeCount(state.answers, today, state.activity);
  const pending = allJobs().filter(job => ["open", "urgent"].includes(jobPhase(job, today)));
  const upcoming = [...pending].sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 4);
  const target = Math.min(100, Math.round(todayCount / state.dailyGoal * 100));
  const topicProgress = topics.filter(t => !["Bangla", "English", "General Knowledge", "Mathematics"].includes(t)).slice(0, 5).map(t => {
    const total = topicTotals.get(t);
    const done = questions.filter(q => q.topic === t && state.answers[q.id]).length;
    return `<div class="topic-row"><div class="topic-name"><strong>${h(t)}</strong><span>${done}/${total}</span></div><div class="progress-track"><div class="progress-fill" style="width:${percent(done, total)}%"></div></div></div>`;
  }).join("");
  return `
    ${section("শুভেচ্ছা! আজ কতটুকু এগোবেন?", "আপনার CSE সরকারি চাকরির প্রস্তুতি ও সার্কুলার—এক জায়গায়।",
      '<button class="button soft" data-action="backup">↧ Backup My Data</button>')}
    <section class="hero">
      <div><small>YOUR NEXT MILESTONE · GOVT CSE</small><h2>পরিকল্পিত প্রস্তুতিতেই<br><em>সফলতার শুরু।</em></h2>
      <p>ভিত্তি তৈরি → হাতে-কলমে Coding/SQL → Written practice → সময় ধরে পরীক্ষা → ভুলগুলো পুনরায় রিভিশন।</p>
      <div class="hero-actions"><button class="button primary" data-action="goto" data-target="academy">পড়াশোনা শুরু করুন →</button><button class="button ghost" data-action="goto" data-target="mock">মডেল টেস্ট দিন ◷</button></div></div>
      <div class="hero-illustration" aria-hidden="true"><div class="code-tile"><span>function <b>success</b>() {</span><br><span> &nbsp;<i>practice</i>.daily();</span><br><span> &nbsp;return <b>career</b>;</span><br><span>}</span></div></div>
    </section>
    <div class="stats-grid">
      ${stat("MCQ অনুশীলন", questions.length.toLocaleString("en-US"), "▦", `${questions.filter(q => q.sourceKind === "Original concept/scenario").length} authored + ${questions.filter(q => q.sourceKind === "Numerical drill variant").length.toLocaleString("en-US")} numerical scenario variants`)}
      ${stat("আজ প্র্যাকটিস", todayCount, "✎", `দৈনিক লক্ষ্য ${state.dailyGoal}টি`, "green")}
      ${stat("সঠিক উত্তর", answered.length ? `${percent(right, answered.length)}%` : "—", "◎", `${right}/${answered.length}টি উত্তর সঠিক`, "purple")}
      ${stat("Practical Lab", `${Object.values(state.labResults).filter(r => r === "solved").length}/${LABS.length}`, "⌘", "Coding · SQL · Analytical", "orange")}
    </div>
    <div class="dashboard-grid">
      <div class="stack">
        <section class="panel"><div class="panel-header"><div><h3>আসন্ন আবেদনের শেষ সময়</h3><p class="panel-subtitle">যেগুলো আগে দেখা জরুরি</p></div><a class="link-action" href="#circulars">সব সার্কুলার →</a></div>
          ${upcoming.length ? upcoming.map(miniJob).join("") : '<p class="muted">এই মুহূর্তে তালিকায় সক্রিয় সার্কুলার নেই। অফিশিয়াল উৎসে নতুন বিজ্ঞপ্তি দেখুন।</p>'}
        </section>
        <section class="panel"><div class="panel-header"><div><h3>বিষয়ভিত্তিক অগ্রগতি</h3><p class="panel-subtitle">MCQ-তে কোন বিষয় কতদূর</p></div><a class="link-action" href="#practice">প্র্যাকটিস →</a></div>${topicProgress}</section>
        <section class="panel"><div class="panel-header"><div><h3>পরীক্ষার সিলেবাস</h3><p class="panel-subtitle">${state.unitDone.length}/${UNITS.length}টি Study Unit সম্পন্ন</p></div><a class="link-action" href="#academy">সব Unit →</a></div>
          <div class="progress-track"><div class="progress-fill" style="width:${percent(state.unitDone.length, UNITS.length)}%"></div></div>
          <p class="side-tip mt">পদভেদে সিলেবাস বদলায়। আপনার পছন্দের ট্র্যাক: <strong>${h(EXAM_TRACKS.find(t => t.id === state.trackId)?.title || "সমন্বিত CSE/IT")}</strong>।</p>
        </section>
      </div>
      <div class="stack">
        <section class="panel"><div class="panel-header"><div><h3>আজকের লক্ষ্য</h3><p class="panel-subtitle">নিয়মিত প্র্যাকটিসই আপনার শক্তি</p></div></div>
          <div class="goal-row"><div class="goal-ring" style="--degree:${target}%"><strong>${target}%</strong></div><div class="goal-details"><strong>${todayCount} / ${state.dailyGoal} প্রশ্ন</strong><span>${todayCount >= state.dailyGoal ? "আজকের লক্ষ্য পূর্ণ হয়েছে!" : `আর ${state.dailyGoal - todayCount}টি প্রশ্ন সমাধান করুন`}</span></div></div>
          <div class="progress-track"><div class="progress-fill" style="width:${target}%"></div></div><button class="button soft full mt" data-action="goto" data-target="practice">Continue Learning →</button>
        </section>
        <section class="panel"><div class="panel-header"><div><h3>পরের প্রস্তুতি</h3><p class="panel-subtitle">সহজ ৩-ধাপের রুটিন</p></div></div>
          <div class="topic-chip">① Topic study + MCQ <span>৪৫ মিনিট</span></div>
          <div class="topic-chip">② Coding/SQL + Written <span>৪৫ মিনিট</span></div>
          <div class="topic-chip">③ Timed mock + ভুল রিভিশন <span>৩০ মিনিট</span></div>
          <button class="button full mt" data-action="goto" data-target="syllabus">পুরো Study Roadmap →</button>
        </section>
        <section class="panel"><h3>পুনরায় রিভিশন</h3><p class="side-tip mt">আজ রিভিশনের সময় হয়েছে <strong>${dueQuestionIds(questions, state.reviewSchedule, today).size}টি</strong> প্রশ্নের। ভুল উত্তর আবার দিন এবং ধাপে ধাপে interval বাড়ান।</p><button class="button soft full mt" data-action="review-due">Due Questions →</button></section>
        <section class="panel"><span class="badge">Daily discovery</span><p class="side-tip mt">প্রতিদিন নতুন IT/CSE নিয়োগের সম্ভাব্য লিংক খোঁজার অটোমেশন রয়েছে। <strong>${DISCOVERY_ITEMS.length}টি</strong> লিংক পাওয়া গেছে। শেষ সফল পরীক্ষা: <strong>${DISCOVERY_LAST_RUN ? labelDate(DISCOVERY_LAST_RUN.slice(0, 10)) : "প্রথম রান অপেক্ষমাণ"}</strong>। এগুলো অফিশিয়াল বিজ্ঞপ্তি হিসেবে যাচাই করা নয়।</p><button class="button soft full mt" data-action="goto" data-target="circulars">নতুন খোঁজ দেখুন →</button></section>
      </div>
    </div>`;
}

function renderCirculars() {
  const search = ui.jobSearch.toLocaleLowerCase();
  const discovered = DISCOVERY_ITEMS.filter(job => `${job.title} ${job.publisher}`.toLocaleLowerCase().includes(search));
  let jobs = allJobs().filter(job => {
    const matchSearch = `${job.title} ${job.organization} ${job.note || ""} ${(job.tags || []).join(" ")}`.toLowerCase().includes(search);
    const matchSector = ui.jobSector === "All" || job.sector === ui.jobSector;
    const phase = jobPhase(job);
    const matchStatus = ui.jobStatus === "All" || (ui.jobStatus === "Open" && ["open", "urgent"].includes(phase)) || (ui.jobStatus === "Closed" && phase === "closed") || (ui.jobStatus === "Saved" && state.jobStatuses[job.id] && state.jobStatuses[job.id] !== "none");
    return matchSearch && matchSector && matchStatus && (ui.showExpired || phase !== "closed" || ui.jobStatus === "Closed");
  });
  const card = job => {
    const url = safeHttps(job.url);
    const circularUrl = safeHttps(job.circularUrl);
    const status = state.jobStatuses[job.id] || "none";
    return `<article class="job-card">
      <div class="job-top">${jobLogo(job)}<div class="job-name"><h3>${h(job.title)}</h3><p>${h(job.organization)} <span class="muted">· ${h(job.sector)}</span></p></div>${jobBadge(job)}</div>
      <div class="job-meta"><span class="job-detail">◷ Deadline: ${labelDate(job.deadline)}</span>${job.vacancies ? `<span class="job-detail">◫ পদ: ${h(job.vacancies)}</span>` : ""}<span class="job-detail">${job.custom ? "✎ আপনার যোগ করা" : "✓ Official source linked"}</span></div>
      <p class="job-note">${h(job.note || "মূল বিজ্ঞপ্তি দেখে শিক্ষাগত যোগ্যতা, বয়স ও অন্যান্য শর্ত যাচাই করুন।")}</p>
      <div class="job-footer"><div class="left">
        ${url ? `<a class="button primary small" href="${h(url)}" target="_blank" rel="noopener noreferrer">Apply / Official ↗</a>` : ""}
        ${circularUrl ? `<a class="button small" href="${h(circularUrl)}" target="_blank" rel="noopener noreferrer">Circular ↗</a>` : ""}
      </div><div class="right"><select class="select" data-job-status="${h(job.id)}" aria-label="আবেদনের অবস্থা">
        <option value="none"${status === "none" ? " selected" : ""}>Not tracked</option>
        <option value="saved"${status === "saved" ? " selected" : ""}>☆ Saved</option>
        <option value="applied"${status === "applied" ? " selected" : ""}>✓ Applied</option>
        <option value="exam"${status === "exam" ? " selected" : ""}>◷ Exam prep</option>
      </select>${job.custom ? `<button class="button small danger" data-action="delete-job" data-id="${h(job.id)}">Delete</button>` : ""}</div></div>
    </article>`;
  };
  const discoveryList = discovered.slice(0, 35).map(job => `<article class="discovery-card">
    <div><span class="badge urgent">যাচাই বাকি</span><small class="muted">${h(labelDate(job.publishedOn))} · ${h(job.publisher)}</small></div>
    <h3>${h(job.title)}</h3><p>নিউজ-সূচি থেকে স্বয়ংক্রিয়ভাবে পাওয়া সম্ভাব্য বিজ্ঞপ্তি। পদ, যোগ্যতা ও আবেদনের শেষ সময় মূল নিয়োগকারী প্রতিষ্ঠানের ওয়েবসাইটে নিশ্চিত করুন।</p>
    <a class="button small" href="${h(safeHttps(job.url))}" target="_blank" rel="noopener noreferrer">খবর / সূত্র দেখুন ↗</a>
  </article>`).join("");
  const discoveryBanner = `<section class="panel discovery-panel"><div class="panel-header"><div><h2>প্রতিদিন স্বয়ংক্রিয় নতুন খোঁজ <span class="badge">${DISCOVERY_ITEMS.length} links</span></h2><p class="panel-subtitle">শেষ সফল আপডেট: ${DISCOVERY_LAST_RUN ? labelDate(DISCOVERY_LAST_RUN.slice(0, 10)) : "প্রথম অটোমেশন চালুর অপেক্ষায়"} · সফল উৎস: ${DISCOVERY_FEEDS_OK}/6</p></div></div>
    <div class="info-banner"><b>!</b><p>এগুলো নিউজ সার্চ থেকে পাওয়া <strong>যাচাই না-করা সূত্র</strong>, নিশ্চিত চাকরির সার্কুলার নয়। ভুয়া নিয়োগ এড়াতে অফিসিয়াল PDF এবং আবেদন পোর্টালের শেষ তারিখ দেখে নিন। প্রতিদিন সকাল আনুমানিক ৭:১৭ (বাংলাদেশ সময়) GitHub Actions নতুন লিংক খোঁজে; বিলম্ব বা উৎস ব্যর্থ হলে তালিকা নাও বদলাতে পারে।</p></div>
    ${ui.jobStatus !== "All" || ui.jobSector !== "All" ? '<p class="side-tip">নতুন খোঁজ দেখতে Status ও Sector ফিল্টার “সব” রাখুন।</p>' : (discovered.length ? `<div class="discovery-grid">${discoveryList}</div><p class="caption mt">খুঁজে পাওয়া ${discovered.length}টির মধ্যে প্রথম ${Math.min(discovered.length, 35)}টি দেখানো হচ্ছে।</p>` : '<p class="side-tip">এখনো নতুন প্রাসঙ্গিক লিংক নেই। অটোমেশন প্রথমবার সফল হলে এখানে দেখাবে।</p>')}
    </section>`;
  return `${section("CSE Job Circulars", "অফিশিয়ালি যাচাই করা সার্কুলার ও প্রতিদিন স্বয়ংক্রিয়ভাবে পাওয়া নতুন সূত্র।",
    '<button class="button primary" data-action="add-job">+ সার্কুলার যোগ করুন</button>')}
    <div class="info-banner"><b>ⓘ</b><p>যাচাই করা মূল সার্কুলার সর্বশেষ ${labelDate(JOBS_LAST_CHECKED)}-এ পর্যালোচিত। স্বয়ংক্রিয় সূত্রগুলো আলাদাভাবে “যাচাই বাকি” দেখানো হয়। আবেদন করার আগে সরকারি PDF-তে বয়স, CGPA, সময় ও পদ নিশ্চিত করুন।</p></div>
    <div class="toolbar"><label class="search-box"><input class="input" id="job-search" type="search" placeholder="প্রতিষ্ঠান, পদ বা কিওয়ার্ড..." value="${h(ui.jobSearch)}" aria-label="সার্কুলার খুঁজুন"></label>
      <select class="select" id="job-sector" aria-label="খাত"><option value="All">সব খাত</option>${["Government","Semi-government","Bank","NGO","Other"].map(s => `<option value="${s}"${ui.jobSector === s ? " selected" : ""}>${s}</option>`).join("")}</select>
      <select class="select" id="job-filter" aria-label="স্ট্যাটাস"><option value="All">সব স্ট্যাটাস</option>${["Open","Closed","Saved"].map(s => `<option value="${s}"${ui.jobStatus === s ? " selected" : ""}>${s}</option>`).join("")}</select>
      <label class="checkbox-inline"><input id="show-expired" type="checkbox"${ui.showExpired ? " checked" : ""}> Expired দেখুন</label>
    </div>
    ${discoveryBanner}
    <div class="section-grid"><div><p class="caption">${notice(jobs.length)} যাচাই করা/নিজের সার্কুলার</p><div class="job-list">${jobs.length ? jobs.map(card).join("") : '<div class="empty"><div class="empty-icon">⌕</div><strong>কোনো সার্কুলার পাওয়া যায়নি</strong><p>ফিল্টার বদলে দেখুন অথবা নিজে নতুন সার্কুলার যুক্ত করুন।</p></div>'}</div></div>
    <aside class="stack"><section class="panel"><div class="panel-header"><div><h3>অফিশিয়াল উৎস</h3><p class="panel-subtitle">নতুন Circular খুঁজতে</p></div></div>
      ${sourceLinks.map(link => `<a class="source-link" href="${h(safeHttps(link.url))}" target="_blank" rel="noopener noreferrer"><span>↗</span><span><strong>${h(link.name)}</strong><small>${h(link.detail)}</small></span><span class="arrow">↗</span></a>`).join("")}
    </section><section class="panel"><h3>আপনার ৩টি গুরুত্বপূর্ণ বিষয়</h3><p class="side-tip mt">বয়স ২৯, BSc CSE (CGPA 3.80) ও ৪+ বছরের অভিজ্ঞতা। তবে প্রতিটি পদের SSC/HSC, বয়সসীমা ও অভিজ্ঞতার শর্ত আলাদাভাবে নিশ্চিত করুন।</p><button class="button soft full" data-action="goto" data-target="practice">প্রস্তুতি শুরু →</button></section>
    </aside></div>`;
}

function renderAcademy() {
  const focus = new Set(trackTopics(state.trackId));
  const visible = UNITS.filter(unit => ui.academyTopic === "All" ? focus.has(unit.topic) : unit.topic === ui.academyTopic);
  const complete = visible.filter(unit => state.unitDone.includes(unit.id)).length;
  return `${section("CSE / IT Study Academy", "শুধু প্রশ্ন মুখস্থ নয়—সিলেবাস, সূত্র, সমস্যা সমাধান এবং পরীক্ষায় ভুল হওয়ার জায়গাগুলো ধরে পড়ুন.",
    '<button class="button primary" data-action="goto" data-target="lab">Coding & SQL Lab →</button>')}
    <div class="info-banner"><b>ⓘ</b><p>এটি CSE চাকরির প্রস্তুতির জন্য নিজস্ব Study Outline, BUET বা কোনো নিয়োগকারীর অফিসিয়াল সিলেবাস নয়। মূল বিজ্ঞপ্তির সিলেবাসকে সর্বোচ্চ অগ্রাধিকার দিন।</p></div>
    <div class="toolbar"><label class="form-field"><span class="subtle">আপনার প্রস্তুতির ধরন</span><select id="track-select" class="select">${EXAM_TRACKS.map(track => `<option value="${track.id}"${state.trackId === track.id ? " selected" : ""}>${h(track.title)}</option>`).join("")}</select></label>
      <label class="form-field"><span class="subtle">বিষয়</span><select id="academy-topic" class="select"><option value="All">এই ট্র্যাকের সব বিষয়</option>${[...new Set(UNITS.map(u => u.topic))].map(topic => `<option value="${h(topic)}"${ui.academyTopic === topic ? " selected" : ""}>${h(topic)}</option>`).join("")}</select></label>
      <span class="badge">${complete}/${visible.length} Unit সম্পন্ন</span>
    </div>
    <div class="unit-grid">${visible.map(unit => `<article class="unit-card ${state.unitDone.includes(unit.id) ? "done" : ""}">
      <div class="unit-header"><span class="badge">${h(unit.topic)}</span><span class="subtle">${state.unitDone.includes(unit.id) ? "✓ সম্পন্ন" : "পড়ার বাকি"}</span></div>
      <h3>${h(unit.title)}</h3><p>${h(unit.concept)}</p>
      ${ui.academyOpen === unit.id ? `<div class="unit-detail"><h4>যা শিখতে হবে</h4><ul>${unit.checklist.map(item => `<li>${h(item)}</li>`).join("")}</ul>
        <p><strong>সাধারণ ভুল:</strong> ${h(unit.pitfalls)}</p><p><strong>লিখে অনুশীলন:</strong> ${h(unit.exercise)}</p></div>` : ""}
      <div class="unit-actions"><button class="button small" data-action="unit-open" data-id="${unit.id}">${ui.academyOpen === unit.id ? "সংক্ষিপ্ত করুন −" : "বিস্তারিত পড়ুন +"}</button>
        <button class="button small ${state.unitDone.includes(unit.id) ? "selected" : ""}" data-action="unit-done" data-id="${unit.id}">${state.unitDone.includes(unit.id) ? "✓ Completed" : "✓ Mark studied"}</button>
        <button class="button small soft" data-action="practice-topic" data-topic="${h(unit.topic)}">MCQ →</button></div>
    </article>`).join("") || '<div class="empty">এই ফিল্টারে কোনো Unit নেই।</div>'}</div>`;
}

function filteredLabs() {
  const query = ui.labSearch.trim().toLocaleLowerCase();
  return LABS.filter(lab =>
    (ui.labKind === "All" || ui.labKind === lab.kind) &&
    (ui.labLevel === "All" || ui.labLevel === lab.difficulty) &&
    (!query || `${lab.title} ${lab.topic} ${lab.prompt}`.toLocaleLowerCase().includes(query))
  );
}

function renderLab() {
  const filtered = filteredLabs();
  if (!filtered.some(lab => lab.id === ui.labId)) ui.labId = filtered[0]?.id || null;
  const lab = labsById.get(ui.labId);
  const done = LABS.filter(item => state.labResults[item.id] === "solved").length;
  const pageSize = 35;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  ui.labPage = Math.max(0, Math.min(pages - 1, ui.labPage));
  const labPage = filtered.slice(ui.labPage * pageSize, (ui.labPage + 1) * pageSize);
  return `${section("Coding, SQL & Analytical Lab", "বাস্তব সমস্যা সমাধান লিখে অনুশীলন করুন। উত্তর নিজের browser-এ থাকবে; এখানে code execute বা auto-grade করা হয় না।")}
    <div class="stats-grid compact-stats">${stat("মোট Lab", LABS.length, "⌘", "Original problems")}${stat("Solved", done, "✓", "Self-assessed", "green")}${stat("Revision needed", Object.values(state.labResults).filter(v => v === "retry").length, "↻", "Reattempt these", "orange")}${stat("Draft saved", Object.values(state.labDrafts).filter(Boolean).length, "▧", "Browser-local", "purple")}</div>
    <div class="toolbar"><label class="search-box"><input class="input" id="lab-search" type="search" placeholder="Problem, topic বা keyword..." value="${h(ui.labSearch)}" aria-label="Search exercises"></label>
      <select class="select" id="lab-kind"><option value="All">সব ধরনের সমস্যা</option>${LAB_KINDS.map(kind => `<option value="${kind}"${ui.labKind === kind ? " selected" : ""}>${kind}</option>`).join("")}</select>
      <select class="select" id="lab-level"><option value="All">সব difficulty</option>${["Medium", "Hard"].map(level => `<option value="${level}"${ui.labLevel === level ? " selected" : ""}>${level}</option>`).join("")}</select>
      <span class="badge">${filtered.length} problems</span></div>
    ${lab ? `<div class="lab-layout"><aside class="panel lab-picker"><div class="panel-header"><h3>Problem list</h3><span class="subtle">${filtered.length}টি</span></div>
      <div class="lab-list">${labPage.map((item, index) => `<button class="lab-list-item ${item.id === lab.id ? "active" : ""}" data-action="lab-open" data-id="${item.id}"><span class="lab-index">${ui.labPage * pageSize + index + 1}</span><span><strong>${h(item.title)}</strong><small>${h(item.kind)} · ${h(item.difficulty)}</small></span><span>${state.labResults[item.id] === "solved" ? "✓" : state.labResults[item.id] === "retry" ? "↻" : ""}</span></button>`).join("")}</div>
      <div class="pager"><button class="button small" data-action="lab-page" data-step="-1" ${ui.labPage === 0 ? "disabled" : ""}>← Prev</button><span>${ui.labPage + 1}/${pages}</span><button class="button small" data-action="lab-page" data-step="1" ${ui.labPage === pages - 1 ? "disabled" : ""}>Next →</button></div></aside>
      <article class="panel lab-work"><div class="question-top"><span class="badge">${h(lab.kind)} · ${h(lab.topic)} · ${h(lab.difficulty)}</span><span class="subtle">${h(lab.id)}</span></div>
        <h2>${h(lab.title)}</h2><p class="lab-prompt">${h(lab.prompt)}</p>${lab.sourceKind ? `<p class="caption">${h(lab.sourceKind)}</p>` : ""}
        <div class="lab-toolrow"><button class="button small" data-action="lab-hint">${ui.labHint ? "Hide hint −" : "Get hint +"}</button><button class="button small" data-action="lab-solution">${ui.labSolution ? "Hide reference −" : "Show reference solution +"}</button></div>
        ${ui.labHint ? `<div class="hint-box"><strong>Hint</strong><p>${h(lab.hint)}</p></div>` : ""}
        <form id="lab-form" data-lab-id="${lab.id}"><label class="form-field"><strong>নিজের সমাধান / code / SQL</strong><textarea class="textarea code-entry" name="solution" maxlength="10000" placeholder="এখানে নিজে সমাধান লিখুন। Save Draft চাপলে এই device-এ সংরক্ষণ হবে...">${h(state.labDrafts[lab.id] || "")}</textarea></label>
          <div class="heading-actions mt"><button class="button primary" type="submit">Save Draft</button><small class="muted">Auto grading নেই · local save</small></div></form>
        ${ui.labSolution ? `<section class="reference-answer"><h3>Reference solution</h3><pre>${h(lab.solution)}</pre><strong>নিজে যাচাই করুন</strong><ul>${lab.rubric.map(r => `<li>${h(r)}</li>`).join("")}</ul><p><strong>Edge cases:</strong> ${h(lab.check)}</p></section>` : ""}
        <div class="lab-assessment"><strong>নিজের সমাধান যাচাই করে মূল্যায়ন</strong><div class="heading-actions mt"><button class="button small ${state.labResults[lab.id] === "solved" ? "selected" : ""}" data-action="lab-rate" data-id="${lab.id}" data-rating="solved">✓ Solved</button><button class="button small ${state.labResults[lab.id] === "retry" ? "selected" : ""}" data-action="lab-rate" data-id="${lab.id}" data-rating="retry">↻ Needs revision</button></div></div>
      </article></div>` : '<div class="empty"><strong>এই ফিল্টারে কোনো সমস্যা নেই</strong><p>Filter বদলে আবার দেখুন।</p></div>'}`;
}

function filteredQuestions() {
  const today = bangladeshToday();
  const due = ui.practiceMode === "Due" ? dueQuestionIds(questions, state.reviewSchedule, today) : null;
  const search = ui.practiceSearch.trim().toLocaleLowerCase();
  return questions.filter(q => {
    if (ui.practiceTopic !== "All" && q.topic !== ui.practiceTopic) return false;
    if (ui.practiceSubtopic !== "All" && q.subtopic !== ui.practiceSubtopic) return false;
    if (ui.practiceDifficulty !== "All" && q.difficulty !== ui.practiceDifficulty) return false;
    if (ui.practiceSource === "Authored" && q.sourceKind !== "Original concept/scenario") return false;
    if (ui.practiceSource === "Variant" && q.sourceKind !== "Numerical drill variant") return false;
    if (search && !`${q.topic} ${q.prompt}`.toLocaleLowerCase().includes(search)) return false;
    const answer = state.answers[q.id];
    if (ui.practiceMode === "Unanswered") return !answer;
    if (ui.practiceMode === "Wrong") return Boolean(answer && !answer.correct);
    if (ui.practiceMode === "Bookmarked") return state.bookmarks.includes(q.id);
    if (ui.practiceMode === "Due") return due.has(q.id);
    return true;
  });
}

function renderPractice() {
  const list = filteredQuestions();
  ui.practiceIndex = Math.min(Math.max(ui.practiceIndex, 0), Math.max(0, list.length - 1));
  const q = list[ui.practiceIndex];
  const answer = q ? state.answers[q.id] : null;
  const subtopics = ui.practiceTopic === "All" ? [] : [...new Set(questions.filter(item => item.topic === ui.practiceTopic && item.subtopic).map(item => item.subtopic))].sort();
  const subtopicControl = !subtopics.length ? "" : '<select class="select" id="practice-subtopic" aria-label="উপবিষয়"><option value="All">সব উপবিষয়</option>' +
    subtopics.map(name => '<option value="' + h(name) + '"' + (ui.practiceSubtopic === name ? " selected" : "") + '>' + h(name) + '</option>').join("") + '</select>';
  const head = section("Topic-wise MCQ Practice", "Concept, calculation এবং ট্র্যাকভিত্তিক অনুশীলন; প্রস্তুতিমূলক প্রশ্ন, অফিসিয়াল বিগত প্রশ্ন নয়।",
    '<button class="button" data-action="goto" data-target="mock">◷ Timed Mock Test</button>');
  const toolbar = `<div class="toolbar"><label class="search-box"><input class="input" type="search" id="practice-search" placeholder="প্রশ্ন খুঁজুন..." aria-label="Search questions" value="${h(ui.practiceSearch)}"></label>
    <select class="select" id="practice-topic" aria-label="প্রশ্নের বিষয়"><option value="All">সব বিষয়</option>${topics.map(t => `<option value="${h(t)}"${ui.practiceTopic === t ? " selected" : ""}>${h(t)}</option>`).join("")}</select>
    ${subtopicControl}
    <select class="select" id="practice-difficulty" aria-label="Difficulty"><option value="All">সব লেভেল</option>${["Easy", "Medium", "Hard"].map(level => `<option value="${level}"${ui.practiceDifficulty === level ? " selected" : ""}>${level}</option>`).join("")}</select>
    <select class="select" id="practice-source" aria-label="Question origin"><option value="All">Original + Variants</option><option value="Authored"${ui.practiceSource === "Authored" ? " selected" : ""}>Authored concepts</option><option value="Variant"${ui.practiceSource === "Variant" ? " selected" : ""}>Numerical scenarios</option></select>
    <select class="select" id="practice-mode" aria-label="প্রশ্নের ধরন"><option value="All">সব প্রশ্ন</option><option value="Unanswered"${ui.practiceMode === "Unanswered" ? " selected" : ""}>Unanswered</option><option value="Wrong"${ui.practiceMode === "Wrong" ? " selected" : ""}>Wrong answers</option><option value="Due"${ui.practiceMode === "Due" ? " selected" : ""}>Due for revision</option><option value="Bookmarked"${ui.practiceMode === "Bookmarked" ? " selected" : ""}>Bookmarked</option></select>
    <span class="badge">${list.length} questions</span>
  </div>`;
  if (!q) return `${head}${toolbar}<div class="empty"><div class="empty-icon">✓</div><strong>এই ফিল্টারে কোনো প্রশ্ন নেই</strong><p>ভিন্ন topic বা filter বেছে নিন।</p><button class="button primary" data-action="clear-practice-filter">সব প্রশ্ন দেখুন</button></div>`;
  const options = q.options.map((opt, index) => {
    const chosen = answer && answer.selected === index;
    const kind = answer ? (q.answer === index ? "correct" : chosen ? "wrong" : "") : "";
    return `<button class="option ${kind} ${chosen ? "chosen" : ""}" data-action="answer" data-id="${q.id}" data-index="${index}" ${answer ? "disabled" : ""}><span class="letter">${String.fromCharCode(65 + index)}</span><span>${h(opt)}</span></button>`;
  }).join("");
  const explanation = answer ? `<div class="explanation ${answer.correct ? "" : "wrong"}"><strong>${answer.correct ? "✓ সঠিক উত্তর!" : "✦ সঠিক উত্তর: " + String.fromCharCode(65 + q.answer)}</strong><p>${h(q.explain)}</p><p>${h(q.bn)}</p></div>` : "";
  const sidebar = topics.filter(t => ui.practiceTopic === "All" || ui.practiceTopic === t).slice(0, 10).map(t => {
    const answered = questions.filter(x => x.topic === t && state.answers[x.id]).length;
    const total = questions.filter(x => x.topic === t).length;
    return `<div class="topic-chip ${q.topic === t ? "active" : ""}"><span>${h(t)}</span><span>${answered}/${total}</span></div>`;
  }).join("");
  return `${head}${toolbar}<div class="learning-layout"><div>
    <article class="question-card"><div class="question-top"><span class="badge">${h(q.topic)} · ${h(q.difficulty)} · ${q.sourceKind === "Numerical drill variant" ? "Drill variant" : "Original question"}</span><button class="button small ${state.bookmarks.includes(q.id) ? "selected" : ""}" data-action="bookmark" data-id="${q.id}">${state.bookmarks.includes(q.id) ? "★ Saved" : "☆ Bookmark"}</button></div>
    <h2>${h(q.prompt)}</h2><div class="options">${options}</div>${explanation}
    <div class="question-bottom"><span class="counter">প্রশ্ন ${ui.practiceIndex + 1} / ${list.length}</span><div class="heading-actions">${answer ? `<button class="button small" data-action="retry" data-id="${q.id}">↺ Retry</button>` : ""}
    <button class="button small" data-action="practice-prev"${ui.practiceIndex === 0 ? " disabled" : ""}>← Previous</button>
    <button class="button primary small" data-action="practice-next"${ui.practiceIndex === list.length - 1 ? " disabled" : ""}>Next →</button></div></div>
    </article></div><aside class="stack"><section class="panel"><div class="panel-header"><div><h3>Study Progress</h3><p class="panel-subtitle">বিষয়ভিত্তিক সমাধান</p></div></div>${sidebar}</section>
    <section class="panel"><h3>মনে রাখুন</h3><p class="side-tip mt">প্রথমে নিজে উত্তর দিন। Correct/Wrong অনুযায়ী ১, ৩, ৭, ১৪, ৩০ দিনের পুনরাবৃত্তির সময়সূচি তৈরি হবে। গণনাভিত্তিক ভ্যারিয়েন্টকে আলাদা ধারণা হিসেবে গণ্য করবেন না।</p></section></aside></div>`;
}

function renderWritten() {
  const search = ui.writtenSearch.trim().toLocaleLowerCase();
  const list = writtenQuestions.filter(q => (ui.writtenTopic === "All" || q.topic === ui.writtenTopic) && (!search || `${q.topic} ${q.prompt}`.toLocaleLowerCase().includes(search)));
  const pageSize = 20;
  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  ui.writtenPage = Math.max(0, Math.min(ui.writtenPage, pages - 1));
  const page = list.slice(ui.writtenPage * pageSize, (ui.writtenPage + 1) * pageSize);
  return `${section("Technical & General Written", "প্রথমে সময় ধরে নিজের উত্তর লিখুন; পরে reference answer মিলিয়ে self-assess করুন।")}
    <div class="info-banner"><b>✎</b><p>এখানে নিজস্ব রচনামূলক প্রশ্ন, concept-based designs এবং parameterized worked numericals আছে। এগুলো official previous paper নয়। একাধিক গ্রহণযোগ্য solution থাকলে নমুনা উত্তরকে নির্দেশনা হিসেবে নিন।</p></div>
    <div class="toolbar"><label class="search-box"><input class="input" id="written-search" type="search" placeholder="Written প্রশ্ন খুঁজুন..." value="${h(ui.writtenSearch)}" aria-label="Search written"></label><select class="select" id="written-topic" aria-label="Written subject"><option value="All">সব বিষয়</option>${[...new Set(writtenQuestions.map(q => q.topic))].map(t => `<option value="${h(t)}"${ui.writtenTopic === t ? " selected" : ""}>${h(t)}</option>`).join("")}</select><span class="badge">${state.writtenDone.length}/${writtenQuestions.length}টি পড়া হয়েছে</span><span class="badge">${list.length} matched</span></div>
    <div class="written-list">${page.map(q => `<article class="written-item"><div class="written-head"><div><span>${h(q.topic)} · ${h(q.id.toUpperCase())} ${q.sourceKind ? `· ${h(q.sourceKind)}` : ""}</span><strong>${h(q.prompt)}</strong></div><div class="written-actions">
      <button class="button small ${state.writtenDone.includes(q.id) ? "selected" : ""}" data-action="written-done" data-id="${q.id}">${state.writtenDone.includes(q.id) ? "✓ Studied" : "Mark studied"}</button>
      <button class="button small" data-action="written-toggle" data-id="${q.id}">${ui.expandedWritten.has(q.id) ? "Close −" : "Write & Review +"}</button>
    </div></div>${ui.expandedWritten.has(q.id) ? `<div class="written-answer">
      <form class="written-form" data-written-id="${q.id}"><label class="form-field"><strong>নিজের উত্তর (সময় ধরে লিখুন)</strong><textarea class="textarea code-entry" name="draft" maxlength="10000" placeholder="নিজের ভাষায় উত্তর লিখুন...">${h(state.writtenDrafts[q.id] || "")}</textarea></label><button class="button small primary mt" type="submit">Save answer</button></form>
      <details class="reference-answer mt"><summary>Reference answer মিলিয়ে দেখুন</summary><p>${h(q.answer)}</p><small>${h(q.bn)}</small>${q.rubric ? `<ul>${q.rubric.map(item => `<li>${h(item)}</li>`).join("")}</ul>` : ""}</details>
      <div class="lab-assessment"><strong>Self assessment:</strong><div class="heading-actions mt"><button class="button small ${state.writtenResults[q.id] === "solved" ? "selected" : ""}" data-action="written-rate" data-id="${q.id}" data-rating="solved">✓ Satisfactory</button><button class="button small ${state.writtenResults[q.id] === "retry" ? "selected" : ""}" data-action="written-rate" data-id="${q.id}" data-rating="retry">↻ Rewrite needed</button></div></div></div>` : ""}</article>`).join("") || '<div class="empty">এই ফিল্টারে কোনো Written প্রশ্ন নেই।</div>'}</div><div class="pager"><button class="button" data-action="written-page" data-step="-1" ${ui.writtenPage === 0 ? "disabled" : ""}>← Previous</button><strong>Page ${ui.writtenPage + 1}/${pages}</strong><button class="button" data-action="written-page" data-step="1" ${ui.writtenPage === pages - 1 ? "disabled" : ""}>Next →</button></div>`;
}

function renderPrevious() {
  const search = ui.previousSearch.trim().toLocaleLowerCase();
  const list = state.previousQuestions.filter(q => (ui.previousType === "All" || q.type === ui.previousType) && (!search || `${q.organization} ${q.examName} ${q.topic} ${q.year} ${q.question}`.toLocaleLowerCase().includes(search)));
  const pageSize = 15, pages = Math.max(1, Math.ceil(list.length / pageSize));
  ui.previousPage = Math.max(0, Math.min(ui.previousPage, pages - 1));
  const page = list.slice(ui.previousPage * pageSize, (ui.previousPage + 1) * pageSize);
  return `${section("Previous Question Bank", "আসল বিগত প্রশ্নপত্রের উৎস-লিংকসহ ব্যক্তিগত আর্কাইভ। যাচাই না-করা প্রশ্নকে official paper বলা হবে না।")}
    <div class="info-banner"><b>!</b><p><strong>এখনো পূর্ববর্তী পরীক্ষার কোনো authenticated paper bundled নেই।</strong> PDF/বিগত প্রশ্নের অনুমোদিত উৎস থেকে নিজে যাচাই করে JSON ফাইলে প্রশ্ন সাজিয়ে Import করতে পারেন। Import করা প্রশ্নও <strong>user supplied, independently unverified</strong> হিসেবে চিহ্নিত থাকবে। কোনো BUET, BPSC বা নিয়োগকারীর অনুমোদন দাবি করা হয় না।</p></div>
    <div class="stats-grid compact-stats">${stat("Imported questions", state.previousQuestions.length, "▤", "Browser-local", "purple")}${stat("MCQ papers", state.previousQuestions.filter(q=>q.type==="MCQ").length, "▦", "Source links required")}${stat("Written papers", state.previousQuestions.filter(q=>q.type==="Written").length, "✎", "Archive references")}${stat("Reviewed", state.previousDone.length, "✓", "Your own progress", "green")}</div>
    <section class="panel"><div class="panel-header"><div><h3>Source-backed import</h3><p class="panel-subtitle">আগে Template download → official উৎস থেকে প্রশ্ন পূরণ → JSON import</p></div><div class="heading-actions"><button class="button soft" data-action="previous-template">↓ JSON template</button><button class="button primary" data-action="previous-import">↑ Import JSON</button></div></div>
      <p class="side-tip">প্রতিটি প্রশ্নে organization, examName, year, type (MCQ/Written), topic, question এবং HTTPS sourceUrl থাকতে হবে। MCQ হলে ৪টি options ও 0–3 answer index লাগবে। আপনার তথ্য এই ব্রাউজারেই থাকে; অন্য ডিভাইসে নিতে Backup/Restore করুন।</p></section>
    <div class="toolbar"><label class="search-box"><input id="previous-search" class="input" type="search" aria-label="Previous questions" placeholder="Board, exam, year, subject..." value="${h(ui.previousSearch)}"></label><select id="previous-type" class="select"><option value="All">সব ধরন</option><option value="MCQ"${ui.previousType==="MCQ"?" selected":""}>MCQ</option><option value="Written"${ui.previousType==="Written"?" selected":""}>Written</option></select><span class="badge">${list.length} matched</span></div>
    <div class="written-list">${page.length ? page.map(q => `<article class="written-item"><div class="written-head"><div><span>${h(q.organization)} · ${h(q.examName)} · ${q.year} · ${h(q.type)} · ${h(q.topic)}</span><strong>${h(q.question)}</strong></div><button class="button small danger" data-action="previous-delete" data-id="${h(q.id)}">Delete</button></div><div class="written-answer"><p class="caption">User imported; source has not been independently authenticated.</p>
    ${q.options ? `<ol class="previous-options">${q.options.map(opt => `<li>${h(opt)}</li>`).join("")}</ol>` : ""}
    <details class="reference-answer"><summary>Imported answer</summary><p>${q.type==="MCQ" ? `Option ${String.fromCharCode(65+q.answer)}: ${h(q.options?.[q.answer]||"")}` : h(q.explanation||"No model answer supplied")}</p>${q.type==="MCQ" ? `<p>${h(q.explanation||"")}</p>` : ""}</details>
    <div class="heading-actions mt"><a class="button small" href="${h(safeHttps(q.sourceUrl))}" target="_blank" rel="noopener noreferrer">Source link ↗</a><button class="button small ${state.previousDone.includes(q.id)?"selected":""}" data-action="previous-reviewed" data-id="${h(q.id)}">${state.previousDone.includes(q.id)?"✓ Reviewed":"Mark reviewed"}</button></div></div></article>`).join("") : '<div class="empty"><strong>কোনো পূর্ববর্তী প্রশ্ন যোগ করা হয়নি</strong><p>উৎস যাচাই করে Template দিয়ে Import করুন; কল্পিত বা অসত্য “Previous Questions” যুক্ত করা হয়নি।</p></div>'}</div>
    <div class="pager"><button class="button" data-action="previous-page" data-step="-1"${ui.previousPage===0?" disabled":""}>← Prev</button><span>${ui.previousPage+1}/${pages}</span><button class="button" data-action="previous-page" data-step="1"${ui.previousPage===pages-1?" disabled":""}>Next →</button></div>`;
}

function renderSyllabus() {
  const weeks = [
    { no: "01", name: "Foundation I — DSA & Programming", description: "Data Structures, Algorithms, Programming", tasks: ["Array, linked list, stack, queue, tree ও complexity", "প্রতিদিন ৩০–৫০টি MCQ (ভুলগুলো নোট করুন)", "প্রতিদিন ১টি Coding Lab + ১টি Written"] },
    { no: "02", name: "Foundation II — SQL & Operating System", description: "DBMS & SQL, Operating System", tasks: ["JOIN, GROUP BY, window function, normalization", "Scheduling, deadlock, virtual memory, paging", "প্রতি দুই দিনে ১টি ৫০ প্রশ্নের timed mock"] },
    { no: "03", name: "Computer Systems", description: "Networking, Digital Logic, Architecture", tasks: ["IPv4 subnetting/VLSM, TCP/IP, DNS", "Boolean algebra, K-map, pipeline, cache", "সপ্তাহ শেষে দুটি ৬০-মিনিট মক পরীক্ষা"] },
    { no: "04", name: "Theory & Software Design", description: "Compiler, Automata, OOP, Security, SE", tasks: ["FIRST/FOLLOW, DFA/NFA, DP/greedy", "OOP, SOLID, HTTP, security & testing", "প্রতিদিন ১টি analytical written + ১টি practical"] },
    { no: "05", name: "General Preparation I", description: "Mathematics, English, Bangla", tasks: ["Percentage, ratio, probability, reasoning", "Grammar, vocab, reading, বাংলা ব্যাকরণ", "Technical revision ও আগের ভুলগুলো পুনরায় সমাধান"] },
    { no: "06", name: "General Preparation II + Current Affairs", description: "GK, writing skills, quantitative speed", tasks: ["বাংলাদেশ, সংবিধান, আন্তর্জাতিক সংস্থা", "পরিবর্তনশীল GK তথ্য বর্তমান নির্ভরযোগ্য সূত্রে যাচাই", "Time-bound math এবং ছোট রচনামূলক উত্তর"] },
    { no: "07", name: "Exam-level Problem Solving", description: "Hard DSA, OS numericals, SQL, networks", tasks: ["Hard MCQ ও Practical Lab-এর বেশি সময় দিন", "প্রতিদিন ২টি Written উত্তর সময় বেঁধে লিখুন", "ভুল topic অনুযায়ী revision + ৩টি পূর্ণ মক"] },
    { no: "08", name: "Final Revision & Simulation", description: "Full mocks, previous paper analysis, weak topics", tasks: ["যাচাই করা বিগত প্রশ্ন দিয়ে হাতে লিখে অনুশীলন", "নিজের নিয়োগ বিজ্ঞপ্তির সিলেবাস অনুযায়ী mock settings", "সময়, ভুল ও প্রশ্ন বাছাইয়ের কৌশল পর্যালোচনা"] },
  ];
  const track = EXAM_TRACKS.find(t => t.id === state.trackId) || EXAM_TRACKS[0];
  const relevantUnits = UNITS.filter(unit => track.focus.includes(unit.topic));
  const studied = relevantUnits.filter(unit => state.unitDone.includes(unit.id)).length;
  return `${section("Job Preparation Roadmap", "আট সপ্তাহের সাজানো রুটিন—বিজ্ঞপ্তির সিলেবাস, আপনার দুর্বলতা ও সময় অনুযায়ী বদলাতে পারবেন।",
    '<button class="button primary" data-action="goto" data-target="mock">মডেল টেস্ট →</button>')}
    <div class="info-banner"><b>ⓘ</b><p><strong>একই BUET pattern সব নিয়োগে চলে না।</strong> কর্তৃপক্ষ, পদ ও বছরভেদে MCQ/Written/Practical, নম্বরবণ্টন ও negative marking বদলায়। এখানে কোনো নির্দিষ্ট নম্বরবণ্টনকে নিশ্চিত বলা হচ্ছে না। নিয়োগের মূল বিজ্ঞপ্তি দেখে Mock সেটিং মিলিয়ে নিন।</p></div>
    <div class="toolbar"><label class="form-field"><span class="subtle">Target examination</span><select id="track-select" class="select">${EXAM_TRACKS.map(t => `<option value="${t.id}"${state.trackId === t.id ? " selected" : ""}>${h(t.title)}</option>`).join("")}</select></label><span class="badge">${studied}/${relevantUnits.length} Study Units studied</span></div>
    <p class="side-tip">${h(track.description)}</p>
    <div class="stats-grid">
      ${stat("Study units", relevantUnits.length, "▣", "Track-specific syllabus")}
      ${stat("Practical Labs", LABS.length, "⌘", "Coding / SQL / Analytical", "green")}
      ${stat("Written tasks", writtenQuestions.length, "✎", "Explain & self-assess", "purple")}
      ${stat("8-week plan", "56", "◷", "দিনের প্রস্তুতি রুটিন", "orange")}
    </div>
    <div class="section-grid">
      <div class="stack">
        <section class="panel"><div class="panel-header"><div><h3>আপনার ৮ সপ্তাহের পরিকল্পনা</h3><p class="panel-subtitle">৪৫ মিনিট theory, ৪৫ মিনিট MCQ, ৩০ মিনিট coding/written, ১৫ মিনিট review—নিজের সময়মতো সামঞ্জস্য করুন।</p></div></div>
        ${weeks.map(w => `<div class="roadmap-week"><span class="roadmap-number">${w.no}</span><div><h3>${h(w.name)}</h3><p class="subtle">${h(w.description)}</p><ul>${w.tasks.map(t => `<li>${h(t)}</li>`).join("")}</ul></div></div>`).join("")}
        </section>
        <section class="panel"><h3>এই ট্র্যাকের গুরুত্বপূর্ণ বিষয়</h3>
          ${track.focus.map(topic => `<div class="topic-chip"><span>${h(topic)}</span><strong>${topicTotals.get(topic) || 0} MCQ</strong></div>`).join("")}
          <button class="button primary mt" data-action="goto" data-target="academy">Study Units →</button>
        </section>
      </div>
      <aside class="stack"><section class="panel"><h3>Previous paper reference</h3><p class="side-tip mt">Petrobangla CSE-সম্পর্কিত ২০২৪ সালের প্রশ্নের একটি <strong>তৃতীয়-পক্ষের</strong> সংগ্রহ। উৎস ও বিষয়বস্তু নিজে মিলিয়ে নিন; এটি অফিসিয়াল প্রশ্ন বা ২০২৬ সালের পরীক্ষার প্যাটার্নের নিশ্চয়তা নয়।</p>
        <a href="https://duranta.app/storage/questionbank/1717174124.pdf" class="button full" target="_blank" rel="noopener noreferrer">2024 Question PDF ↗</a>
      </section><section class="panel"><h3>আপনার জন্য পরবর্তী কাজ</h3><p class="side-tip mt">MCQ-তে দুর্বল বিষয় দেখুন, Study Unit পড়ুন, হাতে উত্তর লিখুন এবং নিজের বিজ্ঞপ্তির নির্দিষ্ট নির্দেশনা অনুযায়ী পরীক্ষার সময়/নম্বর নির্ধারণ করুন।</p><button class="button soft full" data-action="goto" data-target="analytics">Weak Topic Analysis →</button><button class="button full mt" data-action="goto" data-target="lab">Practical Labs →</button></section></aside>
    </div>`;
}

function renderAnalytics() {
  const today = bangladeshToday();
  const analytics = topicAnalytics(questions, state.answers, state.reviewSchedule, today);
  const focus = new Set(trackTopics(state.trackId));
  const visible = analytics.filter(g => focus.has(g.topic));
  const recommendations = recommendedTopics(analytics, state.trackId);
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(`${today}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() - (6 - i));
    const key = date.toISOString().slice(0, 10);
    return { date: key, count: state.activity.length ? state.activity.filter(entry => entry.date === key).length : Object.values(state.answers).filter(a => a.at?.startsWith(key)).length };
  });
  const maxDay = Math.max(1, ...days.map(day => day.count));
  const covered = visible.reduce((sum, g) => sum + g.attempted, 0);
  const total = visible.reduce((sum, g) => sum + g.total, 0);
  const completedLabs = Object.values(state.labResults).filter(v => v === "solved").length;
  return `${section("Preparation Analytics", "কত প্রশ্ন পড়েছেন নয়—কোথায় ভুল হচ্ছে, কতদিন আগে রিভিশন করেছেন এবং পরের কাজ কী, দেখুন।")}
    <div class="info-banner"><b>ⓘ</b><p>এগুলো আপনার নিজের অনুশীলনের পরিসংখ্যান; <strong>চাকরি পাওয়ার সম্ভাবনা বা সরকারি পরীক্ষার আনুমানিক নম্বর নয়।</strong> নমুনা ছোট হলে accuracy কম নির্ভরযোগ্য।</p></div>
    <div class="stats-grid">${stat("MCQ coverage", `${percent(covered, total)}%`, "▦", `${covered}/${total} ট্র্যাকের প্রশ্ন`)}
      ${stat("Review due", dueQuestionIds(questions, state.reviewSchedule, today).size, "↻", "১/৩/৭/১৪/৩০ দিনের রিভিশন", "orange")}
      ${stat("Lab completed", completedLabs, "⌘", `${LABS.length}টির মধ্যে self-assessed`, "green")}
      ${stat("Written satisfactory", Object.values(state.writtenResults).filter(v => v === "solved").length, "✎", `${writtenQuestions.length}টি Written task`, "purple")}</div>
    <div class="section-grid"><div class="stack"><section class="panel"><div class="panel-header"><h3>বিষয়ভিত্তিক বিশ্লেষণ</h3><small class="muted">Attempted · Coverage · Accuracy</small></div>
      <div class="analytics-table"><div class="analytics-head"><strong>বিষয়</strong><span>Attempted</span><span>Coverage</span><span>Accuracy</span></div>
      ${visible.map(group => `<div class="analytics-row"><strong>${h(group.topic)}</strong><span>${group.attempted}/${group.total}</span><span>${group.coverage}%</span><span class="${group.accuracy !== null && group.accuracy < 60 ? "bad-accuracy" : ""}">${group.accuracy === null ? "—" : `${group.accuracy}%`}</span></div>`).join("")}</div></section>
      <section class="panel"><h3>গত ৭ দিনের অনুশীলন</h3><div class="activity-chart">${days.map(day => `<div class="activity-day"><div class="activity-bar" style="height:${Math.max(3,Math.round(day.count / maxDay * 94))}px" title="${day.count} answers"></div><small>${h(day.date.slice(5))}</small><strong>${day.count}</strong></div>`).join("")}</div></section></div>
      <aside class="stack"><section class="panel"><h3>অগ্রাধিকার দিয়ে যা পড়বেন</h3><p class="side-tip mt">Coverage কম, accuracy কম বা রিভিশন বেশি বাকি—এসবের সমন্বয়ে সাজানো।</p>
        ${recommendations.map((g, i) => `<div class="recommendation"><span>${i + 1}</span><div><strong>${h(g.topic)}</strong><small>Coverage ${g.coverage}% · Accuracy ${g.accuracy ?? "—"}% · Due ${g.due}</small></div><button class="button small" data-action="practice-topic" data-topic="${h(g.topic)}">Practice →</button></div>`).join("")}
        <button class="button primary full mt" data-action="review-due">Due Revision →</button></section>
        <section class="panel"><h3>গত মক পরীক্ষার ফল</h3>${state.attempts.length ? state.attempts.slice(0, 6).map(a => `<div class="topic-chip"><span>${h(a.at?.slice(0, 10) || "")}</span><strong>${a.percent}%</strong></div>`).join("") : '<p class="side-tip mt">এখনো মক পরীক্ষা দেওয়া হয়নি।</p>'}<button class="button full mt" data-action="goto" data-target="mock">Take Mock →</button></section>
      </aside></div>`;
}

function mockSecondsLeft(mock = state.activeMock) {
  if (!mock) return 0;
  return Math.max(0, Math.ceil((mock.startedAt + mock.minutes * 60000 - Date.now()) / 1000));
}

function timeText(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function startMock() {
  const count = Number(byId("mock-count")?.value || 50);
  const minutes = Number(byId("mock-minutes")?.value || 60);
  const focus = byId("mock-focus")?.value || "All";
  const difficulty = byId("mock-difficulty")?.value || "All";
  const source = byId("mock-source")?.value || "All";
  const trackId = byId("mock-track")?.value || state.trackId;
  ui.mockTrack = trackId;
  const penalty = Number(byId("mock-penalty")?.value || 0);
  const selected = createBalancedMock(questions, { count, focus, difficulty, trackId, source });
  if (!selected.length) { toast("এই ফিল্টারে মক পরীক্ষার প্রশ্ন নেই। ট্র্যাক বা লেভেল বদলান।"); return; }
  state.activeMock = {
    ids: selected.map(q => q.id),
    answers: {}, index: 0, startedAt: Date.now(), minutes, penalty, focus, difficulty, source, trackId
  };
  ui.mockReviewId = null;
  save();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function finishMock(expired = false) {
  const mock = state.activeMock;
  if (!mock) return;
  const list = mock.ids.map(id => questionsById.get(id)).filter(Boolean);
  const score = scoreWithPenalty(list, mock.answers, mock.penalty || 0);
  const attempt = {
    id: `attempt-${Date.now()}`, at: new Date().toISOString(),
    ids: mock.ids, answers: mock.answers, minutes: mock.minutes, penalty: mock.penalty || 0,
    trackId: mock.trackId, focus: mock.focus, difficulty: mock.difficulty, source: mock.source,
    wrong: score.wrong, skipped: score.skipped, net: score.net,
    score: score.correct, total: score.total, percent: score.percent,
    expired
  };
  state.attempts = [attempt, ...state.attempts].slice(0, 60);
  state.activeMock = null;
  ui.mockReviewId = attempt.id;
  clearInterval(timerHandle);
  save();
  render();
  toast(expired ? "সময় শেষ! আপনার ফলাফল দেখুন।" : "মডেল টেস্ট জমা হয়েছে।");
}

function renderMock() {
  const head = section("Timed Mock Examination", "নিজেকে সময়ের মধ্যে যাচাই করুন—ফলাফল, ভুল উত্তর ও ব্যাখ্যা সংরক্ষিত থাকবে।");
  const mock = state.activeMock;
  if (mock && mockSecondsLeft(mock) <= 0) {
    // Defer mutation until the render is complete to avoid recursive output.
    queueMicrotask(() => finishMock(true));
    return `${head}<div class="panel">সময় শেষ। ফলাফল প্রস্তুত হচ্ছে…</div>`;
  }
  if (mock) {
    const index = Math.max(0, Math.min(mock.index, mock.ids.length - 1));
    const q = questionsById.get(mock.ids[index]);
    if (!q) {
      queueMicrotask(() => { state.activeMock = null; save(); render(); toast("পুরোনো অসম্পূর্ণ মক আর উপলব্ধ নেই।"); });
      return `${head}<div class="panel">পুরোনো মক পুনরুদ্ধার করা যাচ্ছে না। নতুন করে শুরু করুন।</div>`;
    }
    const selected = mock.answers[q.id];
    const count = Object.keys(mock.answers).length;
    const options = q.options.map((opt, i) => `<button class="option ${selected === i ? "chosen" : ""}" data-action="mock-answer" data-index="${i}"><span class="letter">${String.fromCharCode(65 + i)}</span><span>${h(opt)}</span></button>`).join("");
    return `${head}<div class="mock-status"><span class="badge">Mock in progress</span><span class="timer" id="mock-clock">${timeText(mockSecondsLeft())}</span><span class="muted">${count}/${mock.ids.length} answered</span><button class="button small danger" data-action="discard-mock">Discard test</button></div>
      <div class="learning-layout"><article class="question-card"><div class="question-top"><span class="badge">${h(q.topic)} · Q${index + 1}</span><span class="muted">১ নম্বর / প্রশ্ন</span></div><h2>${h(q.prompt)}</h2><div class="options">${options}</div>
      <div class="question-bottom"><span class="counter">প্রশ্ন ${index + 1}/${mock.ids.length}</span><div class="heading-actions"><button class="button" data-action="mock-prev"${index === 0 ? " disabled" : ""}>← Previous</button><button class="button" data-action="mock-next"${index === mock.ids.length - 1 ? " disabled" : ""}>Next →</button><button class="button primary" data-action="finish-mock">Submit</button></div></div></article>
      <aside class="panel"><div class="panel-header"><div><h3>Question palette</h3><p class="panel-subtitle">যেকোনো প্রশ্নে ফিরুন</p></div></div><div class="mock-palette">${mock.ids.map((id, i) => `<button class="palette-button ${i === index ? "active" : ""} ${Object.hasOwn(mock.answers, id) ? "answered" : ""}" data-action="mock-jump" data-index="${i}" aria-label="Question ${i + 1}">${i + 1}</button>`).join("")}</div><p class="side-tip mt">টাইমার চলবে। উত্তর পরে বদলাতে পারবেন। রিফ্রেশ করলেও মডেল টেস্ট চলতে থাকবে।</p></aside></div>`;
  }
  const selectedAttempt = state.attempts.find(a => a.id === ui.mockReviewId);
  if (selectedAttempt) {
    const reviewedQuestions = selectedAttempt.ids.map(id => questionsById.get(id)).filter(Boolean);
    const breakdown = mockTopicBreakdown(reviewedQuestions, selectedAttempt.answers);
    const review = reviewedQuestions.map((q, i) => {
      const answer = selectedAttempt.answers[q.id];
      const done = Object.hasOwn(selectedAttempt.answers, q.id);
      const correct = done && answer === q.answer;
      return `<div class="review-item"><span class="badge ${correct ? "open" : "review"}">Q${i + 1} · ${correct ? "Correct" : done ? "Incorrect" : "Unanswered"}</span><p><strong>${h(q.prompt)}</strong></p><p>আপনার উত্তর: ${done ? h(q.options[answer]) : "Skipped"}</p><p>সঠিক: <strong>${h(q.options[q.answer])}</strong></p><p class="muted">${h(q.bn)}</p></div>`;
    }).join("");
    return `${head}<div class="result-banner"><span class="eyebrow">EXAM RESULTS</span><strong>${selectedAttempt.score}/${selectedAttempt.total} correct · Net ${selectedAttempt.net ?? selectedAttempt.score}</strong><p>${selectedAttempt.expired ? "সময় শেষ হয়ে টেস্ট জমা হয়েছে" : "আপনি টেস্ট জমা দিয়েছেন"} · ${new Date(selectedAttempt.at).toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" })}</p><p>${selectedAttempt.wrong ?? "—"} wrong · ${selectedAttempt.skipped ?? "—"} skipped · Wrong প্রতি ${selectedAttempt.penalty ?? 0} নম্বর কর্তন (এই মকে) · ${h(EXAM_TRACKS.find(t => t.id === selectedAttempt.trackId)?.title || "All-round")}</p></div>
      <div class="heading-actions mb"><button class="button primary" data-action="mock-new">+ New Test</button><button class="button" data-action="goto" data-target="practice">Topic Practice →</button></div>
      <section class="panel mb"><h3>Exam-wise subject performance</h3><p class="side-tip">Weak topics প্রথমে দেখানো হয়েছে। Accuracy শুধু চেষ্টা করা MCQ থেকে হিসাব করা; সম্ভাব্য পরীক্ষার স্কোরের নিশ্চয়তা নয়।</p><div class="analytics-table"><div class="analytics-head"><strong>Topic</strong><span>Correct</span><span>Wrong</span><span>Accuracy</span></div>${breakdown.map(g => `<div class="analytics-row"><strong>${h(g.topic)}</strong><span>${g.correct}/${g.total}</span><span>${g.wrong}</span><span>${g.accuracy===null?"—":`${g.accuracy}%`}</span></div>`).join("")}</div></section>
      <section class="panel"><h3>উত্তর ও ব্যাখ্যা</h3>${review}</section>`;
  }
  return `${head}<div class="section-grid"><section class="panel"><div class="eyebrow">EXAM SIMULATOR</div><h2>শুরু করুন আপনার পরের পরীক্ষা</h2><p class="side-tip">বিষয়ভিত্তিক balanced random question selection, difficulty, সময় ও optional negative marking। আসল পরীক্ষার নিয়ম মিলিয়ে সেটিং বাছুন।</p>
    <div class="mock-setup"><div class="form-field"><label for="mock-count">প্রশ্ন সংখ্যা</label><select class="select" id="mock-count"><option>10</option><option>20</option><option selected>50</option><option>100</option><option>200</option></select></div>
    <div class="form-field"><label for="mock-minutes">সময় (মিনিট)</label><select class="select" id="mock-minutes"><option>10</option><option>25</option><option>45</option><option selected>60</option><option>90</option><option>120</option><option>180</option></select></div>
    <div class="form-field"><label for="mock-focus">বিষয়</label><select class="select" id="mock-focus"><option value="All">Technical + General</option><option value="Technical">Technical only</option><option value="General">General only</option></select></div>
    <div class="form-field"><label for="mock-difficulty">Difficulty</label><select class="select" id="mock-difficulty"><option value="All">Balanced: Easy–Hard</option><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
    <div class="form-field"><label for="mock-source">Question quality group</label><select class="select" id="mock-source"><option value="All">Original + Numeric variants</option><option value="Authored">Authored concepts only</option><option value="Variant">Numerical scenarios only</option></select></div>
    <div class="form-field"><label for="mock-penalty">Wrong answer deduction</label><select class="select" id="mock-penalty"><option value="0">None (0)</option><option value="0.25">−0.25</option><option value="0.5">−0.50</option></select></div>
    <div class="form-field"><label for="mock-track">Exam-wise simulation track</label><select class="select" id="mock-track">${EXAM_TRACKS.map(t => `<option value="${t.id}"${t.id === ui.mockTrack ? " selected" : ""}>${h(t.title)}</option>`).join("")}</select></div></div>
    <button class="button primary" data-action="start-mock">Start Exam →</button></section>
    <aside class="stack"><section class="panel"><h3>সাম্প্রতিক ফলাফল</h3>${state.attempts.length ? state.attempts.slice(0, 8).map(a => `<div class="attempt-row"><span><strong>${a.score}/${a.total} · ${a.percent}%</strong><br><small>${new Date(a.at).toLocaleDateString("bn-BD", { timeZone: "Asia/Dhaka" })}</small></span><button class="button small" data-action="review-mock" data-id="${h(a.id)}">Review →</button></div>`).join("") : '<p class="side-tip mt">এখনো কোনো মডেল টেস্ট দেননি।</p>'}</section>
    <section class="panel"><h3>পরীক্ষার কৌশল</h3><p class="side-tip mt">সহজ প্রশ্ন আগে দিন। Negative marking চালু করলে ভুল উত্তর অনুযায়ী নম্বর কাটবে। সঠিক নিয়ম, মোট নম্বর ও সময় নির্দিষ্ট নিয়োগের বিজ্ঞপ্তি থেকে নিন।</p></section></aside></div>`;
}

function renderNotes() {
  return `${section("Notes, Progress & Backup", "প্রস্তুতির নোট রাখুন, দৈনিক লক্ষ্য বদলান, সব ডাটা নিজের কাছে সংরক্ষণ করুন।")}
    <div class="notes-grid">
    <section class="panel"><div class="panel-header"><div><h3>Quick Study Notes</h3><p class="panel-subtitle">যা মনে রাখতে চান লিখে রাখুন</p></div></div>
      <form id="note-form"><textarea class="textarea notes-entry" name="note" maxlength="2000" required placeholder="SQL, DSA, OS বা যেকোনো প্রস্তুতির নোট..."></textarea><div class="heading-actions mt"><button class="button primary" type="submit">+ Save Note</button><span class="subtle">${state.notes.length}টি নোট</span></div></form>
      <div class="mt">${state.notes.length ? state.notes.map(n => `<div class="note-item"><div><small>${new Date(n.at).toLocaleDateString("bn-BD", { timeZone: "Asia/Dhaka" })}</small><p>${h(n.text)}</p></div><button class="button small danger" data-action="delete-note" data-id="${h(n.id)}">Delete</button></div>`).join("") : '<p class="side-tip">এখনো কোনো নোট নেই।</p>'}</div>
    </section>
    <div class="stack"><section class="panel"><h3>Daily Study Goal</h3><div class="settings-row mt"><div><strong>প্রতিদিন MCQ</strong><small>আপনার লক্ষ্য নির্ধারণ করুন</small></div><select class="select" id="daily-goal">${[5,10,15,20,30,40,50].map(n => `<option value="${n}"${state.dailyGoal === n ? " selected" : ""}>${n} questions</option>`).join("")}</select></div>
      <p class="subtle">আজকের সঠিক/ভুল উত্তরসহ মোট উত্তর গণনা করা হয়।</p></section>
      <section class="panel"><h3>Offline Data Backup</h3><p class="side-tip mt">প্রশ্নের উত্তর, মডেল টেস্ট, নিজের সার্কুলার এবং নোট শুধু এই browser/device-এ থাকে। Clear Browsing Data করলে হারাতে পারে। মাঝে মাঝে JSON Backup নিন।</p>
      <div class="heading-actions mt"><button class="button primary" data-action="backup">↓ Download Backup</button><button class="button" data-action="restore">↑ Restore Backup</button></div></section>
      <section class="panel"><h3>অ্যাপ তথ্য</h3><div class="topic-chip">Login / Subscription <strong>None</strong></div><div class="topic-chip">Cloudflare R2 / Database <strong>Not used</strong></div><div class="topic-chip">Offline PWA <strong>Enabled</strong></div><div class="topic-chip">Data location <strong>This browser</strong></div></section></div></div>`;
}

function render() {
  clearInterval(timerHandle);
  const current = route();
  byId("section-title").textContent = routeNames[current];
  byId("today-label").textContent = new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" }).format(new Date());
  for (const link of document.querySelectorAll("[data-nav]")) {
    link.classList.toggle("active", link.dataset.nav === current);
    if (link.dataset.nav === current) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  const views = { dashboard: renderDashboard, circulars: renderCirculars, academy: renderAcademy, practice: renderPractice, lab: renderLab, written: renderWritten, previous: renderPrevious, syllabus: renderSyllabus, mock: renderMock, analytics: renderAnalytics, notes: renderNotes };
  byId("app").innerHTML = views[current]();
  applyTheme();
  if (current === "mock" && state.activeMock) {
    timerHandle = setInterval(() => {
      const remaining = mockSecondsLeft();
      const el = byId("mock-clock");
      if (el) {
        el.textContent = timeText(remaining);
        el.classList.toggle("danger", remaining <= 60);
      }
      if (remaining === 0) finishMock(true);
    }, 1000);
  }
}

function showJobModal() {
  byId("modal-root").innerHTML = `<div class="modal-backdrop" data-modal-backdrop="1"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-header"><h2 id="modal-title">নিজের সার্কুলার যোগ করুন</h2><button class="icon-button" data-action="close-modal" aria-label="Close">×</button></div>
    <form id="job-form"><div class="modal-grid"><div class="form-field"><label for="job-title">পদের নাম *</label><input class="input" id="job-title" name="title" required maxlength="130" placeholder="Assistant Programmer"></div>
    <div class="form-field"><label for="job-organization">প্রতিষ্ঠান *</label><input class="input" id="job-organization" name="organization" required maxlength="130" placeholder="Organization"></div>
    <div class="form-field"><label for="job-deadline">আবেদনের শেষ তারিখ *</label><input class="input" id="job-deadline" type="date" name="deadline" required></div>
    <div class="form-field"><label for="job-sector-entry">খাত</label><select class="select" id="job-sector-entry" name="sector"><option>Government</option><option>Semi-government</option><option>Bank</option><option>NGO</option><option>Other</option></select></div></div>
    <div class="form-field"><label for="job-link">অফিশিয়াল আবেদন / বিজ্ঞপ্তির HTTPS লিংক *</label><input class="input" id="job-link" type="url" name="url" required placeholder="https://..."></div>
    <div class="form-field"><label for="job-note">নোট (ঐচ্ছিক)</label><textarea class="textarea" name="note" id="job-note" maxlength="400" rows="3" placeholder="বয়স, CGPA, আবেদন ফি, পরীক্ষার প্রস্তুতি..."></textarea></div>
    <div class="modal-actions"><button class="button" type="button" data-action="close-modal">Cancel</button><button class="button primary" type="submit">+ Save Circular</button></div></form>
  </div></div>`;
  byId("job-title")?.focus();
}

function downloadBackup() {
  const payload = { app: "CSE Prep Desk", exportedAt: new Date().toISOString(), state: normalizeState(state) };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cseprep-backup-${bangladeshToday()}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Backup ডাউনলোড হয়েছে। ফাইলটি নিরাপদে রাখুন।");
}

function downloadPreviousTemplate() {
  const blob = new Blob([JSON.stringify(PREVIOUS_TEMPLATE, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = "previous-paper-import-template.json";
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.addEventListener("click", event => {
  if (event.target.id === "sidebar-backdrop") {
    document.querySelector(".sidebar").classList.remove("open");
    byId("sidebar-backdrop").classList.remove("open");
    return;
  }
  if (event.target.matches("[data-modal-backdrop]")) {
    byId("modal-root").replaceChildren();
    return;
  }
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id;
  const index = Number(button.dataset.index);
  if (action === "goto") return go(button.dataset.target);
  if (action === "menu") {
    document.querySelector(".sidebar").classList.toggle("open");
    byId("sidebar-backdrop").classList.toggle("open");
  } else if (action === "theme") {
    state.theme = state.theme === "dark" ? "light" : "dark";
    save(); applyTheme();
  } else if (action === "install") {
    if (ui.installPrompt) {
      ui.installPrompt.prompt();
      ui.installPrompt.userChoice.finally(() => { ui.installPrompt = null; });
    } else toast("Chrome/Edge: browser menu → Install App। iPhone: Share → Add to Home Screen।");
  } else if (action === "add-job") showJobModal();
  else if (action === "close-modal") byId("modal-root").replaceChildren();
  else if (action === "delete-job") {
    if (confirm("আপনার যোগ করা সার্কুলার মুছে ফেলবেন?")) {
      state.customJobs = state.customJobs.filter(job => job.id !== id);
      delete state.jobStatuses[id]; save(); render();
    }
  } else if (action === "answer") {
    const q = questionsById.get(id);
    if (!q || state.answers[id] || index < 0 || index >= q.options.length) return;
    const today = bangladeshToday();
    const correct = index === q.answer;
    state.answers[id] = { selected: index, correct, at: `${today}T${new Date().toISOString().slice(11)}` };
    state.reviewSchedule[id] = nextReview(state.reviewSchedule[id], correct, today);
    state.activity.push({ date: today, topic: q.topic, correct });
    state.activity = state.activity.slice(-2000);
    save(); render();
  } else if (action === "retry") {
    delete state.answers[id]; save(); render();
  } else if (action === "bookmark") {
    state.bookmarks = state.bookmarks.includes(id) ? state.bookmarks.filter(x => x !== id) : [...state.bookmarks, id];
    save(); render();
  } else if (action === "practice-next" || action === "practice-prev") {
    ui.practiceIndex += action === "practice-next" ? 1 : -1; render();
  } else if (action === "clear-practice-filter") {
    ui.practiceMode = "All"; ui.practiceTopic = "All"; ui.practiceSubtopic = "All"; ui.practiceDifficulty = "All"; ui.practiceSearch = ""; ui.practiceSource = "All"; ui.practiceIndex = 0; render();
  } else if (action === "practice-topic") {
    const topic = button.dataset.topic;
    if (!topics.includes(topic)) return;
    ui.practiceTopic = topic; ui.practiceSubtopic = "All"; ui.practiceMode = "All"; ui.practiceDifficulty = "All"; ui.practiceIndex = 0;
    go("practice");
  } else if (action === "review-due") {
    ui.practiceTopic = "All"; ui.practiceSubtopic = "All"; ui.practiceDifficulty = "All"; ui.practiceSearch = ""; ui.practiceMode = "Due"; ui.practiceIndex = 0;
    go("practice");
  } else if (action === "unit-open") {
    if (!UNIT_BY_ID[id]) return;
    ui.academyOpen = ui.academyOpen === id ? null : id;
    render();
  } else if (action === "unit-done") {
    if (!UNIT_BY_ID[id]) return;
    state.unitDone = state.unitDone.includes(id) ? state.unitDone.filter(x => x !== id) : [...state.unitDone, id];
    save(); render();
  } else if (action === "lab-open") {
    if (!labsById.has(id)) return;
    ui.labId = id; ui.labHint = false; ui.labSolution = false; render();
  } else if (action === "lab-page") {
    ui.labPage += Number(button.dataset.step) || 0;
    ui.labId = filteredLabs()[Math.max(0,ui.labPage)*35]?.id || ui.labId;
    ui.labHint = false; ui.labSolution = false; render();
  } else if (action === "lab-hint") {
    ui.labHint = !ui.labHint; render();
  } else if (action === "lab-solution") {
    ui.labSolution = !ui.labSolution; render();
  } else if (action === "lab-rate") {
    if (!labsById.has(id) || !["solved", "retry"].includes(button.dataset.rating)) return;
    state.labResults[id] = button.dataset.rating; save(); render();
  } else if (action === "written-toggle") {
    if (ui.expandedWritten.has(id)) ui.expandedWritten.delete(id);
    else ui.expandedWritten.add(id);
    render();
  } else if (action === "written-page") {
    ui.writtenPage += Number(button.dataset.step) || 0; ui.expandedWritten.clear(); render();
  } else if (action === "previous-page") {
    ui.previousPage += Number(button.dataset.step) || 0; render();
  } else if (action === "previous-template") downloadPreviousTemplate();
  else if (action === "previous-import") byId("previous-input").click();
  else if (action === "previous-reviewed") {
    if (!state.previousQuestions.some(q => q.id === id)) return;
    state.previousDone = state.previousDone.includes(id) ? state.previousDone.filter(q => q !== id) : [...state.previousDone, id];
    save(); render();
  } else if (action === "previous-delete") {
    if (!confirm("এই imported previous question মুছে ফেলবেন?")) return;
    state.previousQuestions = state.previousQuestions.filter(q => q.id !== id);
    state.previousDone = state.previousDone.filter(q => q !== id); save(); render();
  } else if (action === "written-done") {
    state.writtenDone = state.writtenDone.includes(id) ? state.writtenDone.filter(x => x !== id) : [...state.writtenDone, id];
    save(); render();
  } else if (action === "written-rate") {
    if (!writtenQuestions.some(q => q.id === id) || !["solved", "retry"].includes(button.dataset.rating)) return;
    state.writtenResults[id] = button.dataset.rating;
    if (button.dataset.rating === "solved" && !state.writtenDone.includes(id)) state.writtenDone.push(id);
    save(); render();
  } else if (action === "start-mock") startMock();
  else if (action === "mock-answer") {
    const mock = state.activeMock;
    if (!mock || index < 0 || index > 3) return;
    mock.answers[mock.ids[mock.index]] = index; save(); render();
  } else if (action === "mock-jump") {
    if (state.activeMock && index >= 0 && index < state.activeMock.ids.length) { state.activeMock.index = index; save(); render(); }
  } else if (action === "mock-next" || action === "mock-prev") {
    if (state.activeMock) { state.activeMock.index += action === "mock-next" ? 1 : -1; save(); render(); }
  } else if (action === "finish-mock") {
    const pending = state.activeMock?.ids.length - Object.keys(state.activeMock?.answers || {}).length;
    if (confirm(pending ? `${pending}টি প্রশ্নের উত্তর দেওয়া হয়নি। জমা দেবেন?` : "মডেল টেস্ট জমা দেবেন?")) finishMock();
  } else if (action === "discard-mock") {
    if (confirm("চলমান পরীক্ষা বাতিল করবেন? এই পরীক্ষার উত্তর আর থাকবে না।")) {
      state.activeMock = null; save(); render();
    }
  } else if (action === "review-mock") { ui.mockReviewId = id; render(); }
  else if (action === "mock-new") { ui.mockReviewId = null; render(); }
  else if (action === "backup") downloadBackup();
  else if (action === "restore") byId("restore-input").click();
  else if (action === "delete-note") {
    state.notes = state.notes.filter(n => n.id !== id); save(); render();
  }
});

document.addEventListener("input", event => {
  const filters = { "job-search": "jobSearch", "practice-search": "practiceSearch", "written-search": "writtenSearch", "lab-search": "labSearch", "previous-search": "previousSearch" };
  const property = filters[event.target.id];
  if (property) {
    const pos = event.target.selectionStart;
    ui[property] = event.target.value;
    if (property === "practiceSearch") ui.practiceIndex = 0;
    if (property === "writtenSearch") ui.writtenPage = 0;
    if (property === "labSearch") ui.labPage = 0;
    if (property === "previousSearch") ui.previousPage = 0;
    render();
    const next = byId(event.target.id);
    if (next) { next.focus(); next.setSelectionRange(pos, pos); }
  }
});

document.addEventListener("change", event => {
  const element = event.target;
  const id = element.id;
  if (id === "job-sector") { ui.jobSector = element.value; render(); }
  if (id === "job-filter") { ui.jobStatus = element.value; render(); }
  if (id === "show-expired") { ui.showExpired = element.checked; render(); }
  if (id === "practice-topic") { ui.practiceTopic = element.value; ui.practiceSubtopic = "All"; ui.practiceIndex = 0; render(); }
  if (id === "practice-subtopic") { ui.practiceSubtopic = element.value; ui.practiceIndex = 0; render(); }
  if (id === "practice-mode") { ui.practiceMode = element.value; ui.practiceIndex = 0; render(); }
  if (id === "practice-difficulty") { ui.practiceDifficulty = element.value; ui.practiceIndex = 0; render(); }
  if (id === "practice-source") { ui.practiceSource = element.value; ui.practiceIndex = 0; render(); }
  if (id === "written-topic") { ui.writtenTopic = element.value; ui.writtenPage = 0; render(); }
  if (id === "mock-track") { ui.mockTrack = element.value; }
  if (id === "academy-topic") { ui.academyTopic = element.value; render(); }
  if (id === "track-select") { if (EXAM_TRACKS.some(t => t.id === element.value)) { state.trackId = element.value; ui.mockTrack = element.value; save(); render(); } }
  if (id === "previous-type") { ui.previousType = element.value; ui.previousPage = 0; render(); }
  if (id === "lab-kind") { ui.labKind = element.value; ui.labPage = 0; render(); }
  if (id === "lab-level") { ui.labLevel = element.value; ui.labPage = 0; render(); }
  if (id === "daily-goal") { state.dailyGoal = Number(element.value); save(); toast("দৈনিক লক্ষ্য পরিবর্তন হয়েছে।"); render(); }
  if (element.matches("#lab-form textarea")) {
    const labId = element.closest("form")?.dataset.labId;
    if (labsById.has(labId)) { state.labDrafts[labId] = element.value.slice(0, 10000); save(); }
  }
  if (element.matches(".written-form textarea")) {
    const qId = element.closest("form")?.dataset.writtenId;
    if (writtenQuestions.some(q => q.id === qId)) { state.writtenDrafts[qId] = element.value.slice(0, 10000); save(); }
  }
  if (element.hasAttribute("data-job-status")) {
    const status = element.value;
    if (["none", "saved", "applied", "exam"].includes(status)) {
      state.jobStatuses[element.dataset.jobStatus] = status; save(); render();
    }
  }
  if (id === "restore-input") {
    const file = element.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast("Backup ফাইলটি ৮ MB-এর বেশি।"); element.value = ""; return; }
    file.text().then(content => {
      const data = JSON.parse(content);
      if (data.app !== "CSE Prep Desk" || !data.state || data.state.version !== 1)
        throw new Error("এই অ্যাপের সঠিক v1 backup নয়।");
      const restored = normalizeState(data.state);
      if (!confirm("বর্তমান local data বদলে backup ফিরিয়ে আনবেন?")) return;
      state = restored; save(); render(); toast("Backup restore সম্পন্ন।");
    }).catch(() => toast("Backup ফাইল পড়া যায়নি বা format ভুল।")).finally(() => { element.value = ""; });
  }
  if (id === "previous-input") {
    const file = element.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast("প্রশ্নের JSON ৩ MB-এর বেশি।"); element.value = ""; return; }
    file.text().then(content => {
      const imported = JSON.parse(content);
      const merged = mergePrevious(state.previousQuestions, imported);
      if (!confirm(`${merged.length - state.previousQuestions.length}টি নতুন/পরিবর্তিত প্রশ্ন পাওয়া গেছে। সূত্র যাচাই করে Import করবেন?`)) return;
      state.previousQuestions = merged;
      save(); ui.previousPage = 0; render(); toast("Previous question archive আপডেট হয়েছে।");
    }).catch(error => toast(`Import সম্ভব হয়নি: ${String(error.message).slice(0, 135)}`)).finally(() => { element.value = ""; });
  }
});

document.addEventListener("submit", event => {
  if (event.target.id === "lab-form") {
    event.preventDefault();
    const id = event.target.dataset.labId;
    if (!labsById.has(id)) return;
    state.labDrafts[id] = String(new FormData(event.target).get("solution") || "").slice(0, 10000);
    save(); toast("সমাধান এই browser-এ সেভ হয়েছে।");
  }
  if (event.target.classList.contains("written-form")) {
    event.preventDefault();
    const id = event.target.dataset.writtenId;
    if (!writtenQuestions.some(q => q.id === id)) return;
    state.writtenDrafts[id] = String(new FormData(event.target).get("draft") || "").slice(0, 10000);
    save(); toast("Written উত্তর সেভ হয়েছে।");
  }
  if (event.target.id === "job-form") {
    event.preventDefault();
    try {
      const input = Object.fromEntries(new FormData(event.target).entries());
      const job = validateCustomJob(input);
      state.customJobs.unshift(job); save(); byId("modal-root").replaceChildren(); render();
      toast("আপনার সার্কুলার যোগ হয়েছে।");
    } catch (error) { toast(error.message); }
  }
  if (event.target.id === "note-form") {
    event.preventDefault();
    const text = String(new FormData(event.target).get("note") || "").trim();
    if (!text) return;
    state.notes.unshift({ id: `note-${Date.now()}`, text: text.slice(0, 2000), at: new Date().toISOString() });
    state.notes = state.notes.slice(0, 200); save(); render(); toast("নোট সংরক্ষণ হয়েছে।");
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") byId("modal-root").replaceChildren();
  if (route() !== "practice" || /input|textarea|select/i.test(event.target.tagName) || event.ctrlKey || event.altKey || event.metaKey) return;
  const index = Number(event.key) - 1;
  if (index >= 0 && index < 4) {
    const q = filteredQuestions()[ui.practiceIndex];
    if (q && !state.answers[q.id]) byId("app").querySelector(`[data-action="answer"][data-index="${index}"]`)?.click();
  }
});

window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });
window.addEventListener("beforeinstallprompt", event => { event.preventDefault(); ui.installPrompt = event; });
window.addEventListener("appinstalled", () => { ui.installPrompt = null; toast("PWA ইনস্টল হয়েছে!"); });

if (!location.hash) location.hash = "dashboard";
render();

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {
    // An unsuccessful SW registration should never block the online app.
  }));
}
