import { STORAGE_KEY, loadState, saveState, normalizeState, bangladeshToday, daysRemaining, jobPhase, escapeHtml as h, safeHttps, shuffle, scoreMock, validateCustomJob, dailyPracticeCount } from "./core.js";
import { officialJobs, JOBS_LAST_CHECKED, sourceLinks } from "./data/jobs.js";
import { questions, writtenQuestions, topics } from "./data/questions.js";

let state = loadState();
const ui = {
  jobSearch: "", jobSector: "All", jobStatus: "All", showExpired: false,
  practiceTopic: "All", practiceMode: "All", practiceIndex: 0,
  writtenTopic: "All", expandedWritten: new Set(),
  mockReviewId: null, installPrompt: null
};
let timerHandle = null;
let toastHandle = null;
const routes = new Set(["dashboard", "circulars", "practice", "written", "syllabus", "mock", "notes"]);
const routeNames = {
  dashboard: "ড্যাশবোর্ড", circulars: "চাকরির সার্কুলার", practice: "MCQ প্র্যাকটিস",
  written: "Written প্রস্তুতি", syllabus: "BUET রোডম্যাপ", mock: "মডেল টেস্ট", notes: "নোট ও ব্যাকআপ"
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
  const answered = Object.entries(state.answers).filter(([key]) => questions.some(q => q.id === key));
  const right = answered.filter(([, a]) => a.correct).length;
  const todayCount = dailyPracticeCount(state.answers, today);
  const pending = allJobs().filter(job => ["open", "urgent"].includes(jobPhase(job, today)));
  const upcoming = [...pending].sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 4);
  const target = Math.min(100, Math.round(todayCount / state.dailyGoal * 100));
  const topicProgress = topics.filter(t => !["Bangla", "English", "General Knowledge", "Mathematics"].includes(t)).slice(0, 5).map(t => {
    const total = questions.filter(q => q.topic === t).length;
    const done = questions.filter(q => q.topic === t && state.answers[q.id]).length;
    return `<div class="topic-row"><div class="topic-name"><strong>${h(t)}</strong><span>${done}/${total}</span></div><div class="progress-track"><div class="progress-fill" style="width:${percent(done, total)}%"></div></div></div>`;
  }).join("");
  return `
    ${section("শুভেচ্ছা! আজ কতটুকু এগোবেন?", "আপনার CSE সরকারি চাকরির প্রস্তুতি ও সার্কুলার—এক জায়গায়।",
      '<button class="button soft" data-action="backup">↧ Backup My Data</button>')}
    <section class="hero">
      <div><small>YOUR NEXT MILESTONE · GOVT CSE</small><h2>পরিকল্পিত প্রস্তুতিতেই<br><em>সফলতার শুরু।</em></h2>
      <p>BUET-ধাঁচের টেকনিক্যাল প্রশ্ন, সাধারণ অংশ এবং সময় ধরে পরীক্ষা—প্রতিদিন অল্প অল্প করে এগিয়ে চলুন।</p>
      <div class="hero-actions"><button class="button primary" data-action="goto" data-target="practice">প্র্যাকটিস শুরু করুন →</button><button class="button ghost" data-action="goto" data-target="mock">মডেল টেস্ট দিন ◷</button></div></div>
      <div class="hero-illustration" aria-hidden="true"><div class="code-tile"><span>function <b>success</b>() {</span><br><span> &nbsp;<i>practice</i>.daily();</span><br><span> &nbsp;return <b>career</b>;</span><br><span>}</span></div></div>
    </section>
    <div class="stats-grid">
      ${stat("প্রশ্নব্যাংক", questions.length, "▦", `${topics.length}টি বিষয় • MCQ`)}
      ${stat("আজ প্র্যাকটিস", todayCount, "✎", `দৈনিক লক্ষ্য ${state.dailyGoal}টি`, "green")}
      ${stat("সঠিক উত্তর", `${percent(right, answered.length)}%`, "◎", `${right}/${answered.length}টি উত্তর সঠিক`, "purple")}
      ${stat("চলমান সার্কুলার", pending.length, "▤", "অফিশিয়াল উৎসের লিংক", "orange")}
    </div>
    <div class="dashboard-grid">
      <div class="stack">
        <section class="panel"><div class="panel-header"><div><h3>আসন্ন আবেদনের শেষ সময়</h3><p class="panel-subtitle">যেগুলো আগে দেখা জরুরি</p></div><a class="link-action" href="#circulars">সব সার্কুলার →</a></div>
          ${upcoming.length ? upcoming.map(miniJob).join("") : '<p class="muted">এই মুহূর্তে তালিকায় সক্রিয় সার্কুলার নেই। অফিশিয়াল উৎসে নতুন বিজ্ঞপ্তি দেখুন।</p>'}
        </section>
        <section class="panel"><div class="panel-header"><div><h3>বিষয়ভিত্তিক অগ্রগতি</h3><p class="panel-subtitle">MCQ-তে কোন বিষয় কতদূর</p></div><a class="link-action" href="#practice">প্র্যাকটিস →</a></div>${topicProgress}</section>
      </div>
      <div class="stack">
        <section class="panel"><div class="panel-header"><div><h3>আজকের লক্ষ্য</h3><p class="panel-subtitle">নিয়মিত প্র্যাকটিসই আপনার শক্তি</p></div></div>
          <div class="goal-row"><div class="goal-ring" style="--degree:${target}%"><strong>${target}%</strong></div><div class="goal-details"><strong>${todayCount} / ${state.dailyGoal} প্রশ্ন</strong><span>${todayCount >= state.dailyGoal ? "আজকের লক্ষ্য পূর্ণ হয়েছে!" : `আর ${state.dailyGoal - todayCount}টি প্রশ্ন সমাধান করুন`}</span></div></div>
          <div class="progress-track"><div class="progress-fill" style="width:${target}%"></div></div><button class="button soft full mt" data-action="goto" data-target="practice">Continue Learning →</button>
        </section>
        <section class="panel"><div class="panel-header"><div><h3>পরের প্রস্তুতি</h3><p class="panel-subtitle">সহজ ৩-ধাপের রুটিন</p></div></div>
          <div class="topic-chip">① Topic-wise MCQ <span>১৫ মিনিট</span></div>
          <div class="topic-chip">② Technical written <span>২০ মিনিট</span></div>
          <div class="topic-chip">③ Timed mock test <span>২৫ মিনিট</span></div>
          <button class="button full mt" data-action="goto" data-target="syllabus">পুরো Study Roadmap →</button>
        </section>
        <section class="panel"><span class="badge">Verified snapshot</span><p class="side-tip mt">সার্কুলার সর্বশেষ ম্যানুয়ালি যাচাই: <strong>${labelDate(JOBS_LAST_CHECKED)}</strong>। এটি স্বয়ংক্রিয় লাইভ ফিড নয়। আবেদন করার আগে অবশ্যই মূল PDF পড়বেন।</p></section>
      </div>
    </div>`;
}

function renderCirculars() {
  const search = ui.jobSearch.toLocaleLowerCase();
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
  return `${section("CSE Job Circulars", "সরকারি, আধা-সরকারি, ব্যাংক ও NGO-র IT/CSE পদের নিজের তালিকা।",
    '<button class="button primary" data-action="add-job">+ সার্কুলার যোগ করুন</button>')}
    <div class="info-banner"><b>ⓘ</b><p>এটি ${labelDate(JOBS_LAST_CHECKED)}-এ যাচাই করা snapshot; নতুন বিজ্ঞপ্তি নিজে যোগ করা যাবে। আবেদন করার আগে মূল সরকারি PDF-তে বয়স, CGPA, সময় ও পদ নিশ্চিত করুন।</p></div>
    <div class="toolbar"><label class="search-box"><input class="input" id="job-search" type="search" placeholder="প্রতিষ্ঠান, পদ বা কিওয়ার্ড..." value="${h(ui.jobSearch)}" aria-label="সার্কুলার খুঁজুন"></label>
      <select class="select" id="job-sector" aria-label="খাত"><option value="All">সব খাত</option>${["Government","Semi-government","Bank","NGO","Other"].map(s => `<option value="${s}"${ui.jobSector === s ? " selected" : ""}>${s}</option>`).join("")}</select>
      <select class="select" id="job-filter" aria-label="স্ট্যাটাস"><option value="All">সব স্ট্যাটাস</option>${["Open","Closed","Saved"].map(s => `<option value="${s}"${ui.jobStatus === s ? " selected" : ""}>${s}</option>`).join("")}</select>
      <label class="checkbox-inline"><input id="show-expired" type="checkbox"${ui.showExpired ? " checked" : ""}> Expired দেখুন</label>
    </div>
    <div class="section-grid"><div><p class="caption">${notice(jobs.length)} সার্কুলার পাওয়া গেছে</p><div class="job-list">${jobs.length ? jobs.map(card).join("") : '<div class="empty"><div class="empty-icon">⌕</div><strong>কোনো সার্কুলার পাওয়া যায়নি</strong><p>ফিল্টার বদলে দেখুন অথবা নিজে নতুন সার্কুলার যুক্ত করুন।</p></div>'}</div></div>
    <aside class="stack"><section class="panel"><div class="panel-header"><div><h3>অফিশিয়াল উৎস</h3><p class="panel-subtitle">নতুন Circular খুঁজতে</p></div></div>
      ${sourceLinks.map(link => `<a class="source-link" href="${h(safeHttps(link.url))}" target="_blank" rel="noopener noreferrer"><span>↗</span><span><strong>${h(link.name)}</strong><small>${h(link.detail)}</small></span><span class="arrow">↗</span></a>`).join("")}
    </section><section class="panel"><h3>আপনার ৩টি গুরুত্বপূর্ণ বিষয়</h3><p class="side-tip mt">বয়স ২৯, BSc CSE (CGPA 3.80) ও ৪+ বছরের অভিজ্ঞতা। তবে প্রতিটি পদের SSC/HSC, বয়সসীমা ও অভিজ্ঞতার শর্ত আলাদাভাবে নিশ্চিত করুন।</p><button class="button soft full" data-action="goto" data-target="practice">প্রস্তুতি শুরু →</button></section>
    </aside></div>`;
}

function filteredQuestions() {
  return questions.filter(q => {
    if (ui.practiceTopic !== "All" && q.topic !== ui.practiceTopic) return false;
    const answer = state.answers[q.id];
    if (ui.practiceMode === "Unanswered") return !answer;
    if (ui.practiceMode === "Wrong") return Boolean(answer && !answer.correct);
    if (ui.practiceMode === "Bookmarked") return state.bookmarks.includes(q.id);
    return true;
  });
}

function renderPractice() {
  const list = filteredQuestions();
  ui.practiceIndex = Math.min(Math.max(ui.practiceIndex, 0), Math.max(0, list.length - 1));
  const q = list[ui.practiceIndex];
  const answer = q ? state.answers[q.id] : null;
  const head = section("Topic-wise MCQ Practice", "BUET-ধাঁচের প্রস্তুতি: টেকনিক্যাল + বাংলা, ইংরেজি, গণিত, সাধারণ জ্ঞান।",
    '<button class="button" data-action="goto" data-target="mock">◷ Timed Mock Test</button>');
  const toolbar = `<div class="toolbar">
    <select class="select" id="practice-topic" aria-label="প্রশ্নের বিষয়"><option value="All">সব বিষয়</option>${topics.map(t => `<option value="${h(t)}"${ui.practiceTopic === t ? " selected" : ""}>${h(t)}</option>`).join("")}</select>
    <select class="select" id="practice-mode" aria-label="প্রশ্নের ধরন"><option value="All">সব প্রশ্ন</option><option value="Unanswered"${ui.practiceMode === "Unanswered" ? " selected" : ""}>Unanswered</option><option value="Wrong"${ui.practiceMode === "Wrong" ? " selected" : ""}>Wrong answers</option><option value="Bookmarked"${ui.practiceMode === "Bookmarked" ? " selected" : ""}>Bookmarked</option></select>
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
    <article class="question-card"><div class="question-top"><span class="badge">${h(q.topic)} · ${h(q.difficulty)}</span><button class="button small ${state.bookmarks.includes(q.id) ? "selected" : ""}" data-action="bookmark" data-id="${q.id}">${state.bookmarks.includes(q.id) ? "★ Saved" : "☆ Bookmark"}</button></div>
    <h2>${h(q.prompt)}</h2><div class="options">${options}</div>${explanation}
    <div class="question-bottom"><span class="counter">প্রশ্ন ${ui.practiceIndex + 1} / ${list.length}</span><div class="heading-actions">${answer ? `<button class="button small" data-action="retry" data-id="${q.id}">↺ Retry</button>` : ""}
    <button class="button small" data-action="practice-prev"${ui.practiceIndex === 0 ? " disabled" : ""}>← Previous</button>
    <button class="button primary small" data-action="practice-next"${ui.practiceIndex === list.length - 1 ? " disabled" : ""}>Next →</button></div></div>
    </article></div><aside class="stack"><section class="panel"><div class="panel-header"><div><h3>Study Progress</h3><p class="panel-subtitle">বিষয়ভিত্তিক সমাধান</p></div></div>${sidebar}</section>
    <section class="panel"><h3>মনে রাখুন</h3><p class="side-tip mt">প্রথমে উত্তর দিন, তারপর ইংরেজি explanation ও বাংলা ব্যাখ্যা পড়ুন। ভুল প্রশ্নগুলো “Wrong answers” থেকে আবার চর্চা করুন।</p></section></aside></div>`;
}

function renderWritten() {
  const list = writtenQuestions.filter(q => ui.writtenTopic === "All" || q.topic === ui.writtenTopic);
  return `${section("Technical & General Written", "ধারণা, অ্যালগরিদম, SQL, Networking ও বিগত পরীক্ষার ধরন অনুযায়ী অনুশীলন।")}
    <div class="info-banner"><b>✎</b><p>এগুলো নিজস্ব প্রস্তুতিমূলক প্রশ্ন ও নমুনা উত্তর; কোনো প্রতিষ্ঠানের আসল বা ফাঁস হওয়া প্রশ্নপত্র নয়।</p></div>
    <div class="toolbar"><select class="select" id="written-topic" aria-label="Written subject"><option value="All">সব বিষয়</option>${[...new Set(writtenQuestions.map(q => q.topic))].map(t => `<option value="${h(t)}"${ui.writtenTopic === t ? " selected" : ""}>${h(t)}</option>`).join("")}</select><span class="badge">${state.writtenDone.length}/${writtenQuestions.length}টি পড়া হয়েছে</span></div>
    <div class="written-list">${list.map(q => `<article class="written-item"><div class="written-head"><div><span>${h(q.topic)} · ${h(q.id.toUpperCase())}</span><strong>${h(q.prompt)}</strong></div><div class="written-actions">
      <button class="button small ${state.writtenDone.includes(q.id) ? "selected" : ""}" data-action="written-done" data-id="${q.id}">${state.writtenDone.includes(q.id) ? "✓ Studied" : "Mark studied"}</button>
      <button class="button small" data-action="written-toggle" data-id="${q.id}">${ui.expandedWritten.has(q.id) ? "Hide answer −" : "Show answer +"}</button>
    </div></div>${ui.expandedWritten.has(q.id) ? `<div class="written-answer"><strong>Sample answer</strong><p>${h(q.answer)}</p><small>${h(q.bn)}</small></div>` : ""}</article>`).join("")}</div>`;
}

function renderSyllabus() {
  const weeks = [
    { no: "01", name: "Core CSE Foundation", description: "Data Structures, Algorithms, DBMS/SQL, Operating System", tasks: ["প্রতিদিন ১৫–২০টি Technical MCQ", "Binary search, sorting, tree, SQL GROUP BY/HAVING লিখে অনুশীলন", "Deadlock, scheduling, transaction ACID সংক্ষেপে লিখুন"] },
    { no: "02", name: "Engineering & Programming", description: "Networking, OOP/C#, Programming, Security, Testing", tasks: ["TCP/UDP, subnetting ও OSI অনুশীলন", "C/C#/Java fundamentals এবং ছোট code trace", "OOP, REST API, testing, security questions"] },
    { no: "03", name: "General Exam Sections", description: "Math, English, Bangla, General Knowledge", tasks: ["প্রতিদিন Math + English MCQ", "বাংলা ব্যাকরণ ও জাতীয়-আন্তর্জাতিক সাধারণ জ্ঞান", "নতুন সার্কুলারের PDF দেখে পরীক্ষার সিলেবাস আপডেট"] },
    { no: "04", name: "Exam Simulation & Review", description: "Timed mock, technical written, weak-topic revision", tasks: ["অন্তত ৪টি timed mock দিন", "Wrong answers ফিল্টার থেকে দুর্বল প্রশ্নগুলো দেখুন", "Written-এ ১৬টি sample answer নিজের ভাষায় লিখুন"] },
  ];
  return `${section("BUET-style Exam Roadmap", "Petrobangla ও অন্যান্য CSE/IT নিয়োগ পরীক্ষার জন্য চার সপ্তাহের বাস্তবসম্মত প্রস্তুতি।",
    '<button class="button primary" data-action="goto" data-target="mock">মডেল টেস্ট →</button>')}
    <div class="info-banner"><b>ⓘ</b><p>এখানে দেওয়া বিভাজনটি পূর্বের একটি CSE নিয়োগ পরীক্ষার প্রশ্নের ভিত্তিতে অনুশীলনের নির্দেশনা। <strong>২০২৬ সালের নিয়োগ পরীক্ষার নিশ্চিত নম্বরবণ্টন নয়।</strong> কর্তৃপক্ষ বা পরীক্ষার দায়িত্বপ্রাপ্ত প্রতিষ্ঠান বদলাতে পারে।</p></div>
    <div class="stats-grid">
      ${stat("General practice", "40", "▧", "ঐতিহাসিক নমুনায় MCQ সংখ্যা")}
      ${stat("General marks", "60", "✓", "পুরোনো প্রশ্নপত্রে মোট নম্বর", "green")}
      ${stat("Technical marks", "40", "⌘", "পুরোনো নমুনায় Written", "purple")}
      ${stat("4-week plan", "28", "◷", "দিনের প্রস্তুতি রুটিন", "orange")}
    </div>
    <div class="section-grid">
      <div class="stack">
        <section class="panel"><div class="panel-header"><div><h3>আপনার ৪ সপ্তাহের পরিকল্পনা</h3><p class="panel-subtitle">Software engineering experience কাজে লাগিয়ে পরীক্ষাভিত্তিক রিভিশন</p></div></div>
        ${weeks.map(w => `<div class="roadmap-week"><span class="roadmap-number">${w.no}</span><div><h3>${h(w.name)}</h3><p class="subtle">${h(w.description)}</p><ul>${w.tasks.map(t => `<li>${h(t)}</li>`).join("")}</ul></div></div>`).join("")}
        </section>
        <section class="panel"><h3>Technical Written-এ যা লিখে অনুশীলন করবেন</h3>
          <div class="topic-chip">Algorithms <span>Code + complexity</span></div><div class="topic-chip">DBMS <span>SQL + normalization</span></div>
          <div class="topic-chip">Operating System <span>Process + scheduling</span></div><div class="topic-chip">Networking <span>TCP/IP + subnetting</span></div>
          <div class="topic-chip">Software Engineering <span>OOP + testing</span></div>
          <button class="button primary mt" data-action="goto" data-target="written">Written Practice →</button>
        </section>
      </div>
      <aside class="stack"><section class="panel"><h3>Previous paper reference</h3><p class="side-tip mt">Petrobangla CSE-সম্পর্কিত ২০২৪ সালের প্রশ্নের একটি তৃতীয়-পক্ষের সংগ্রহ। আগে প্রকাশিত পরীক্ষার ধরন বুঝতে ব্যবহার করুন; অফিসিয়াল সিলেবাস বা প্রশ্নের নিশ্চয়তা নয়।</p>
        <a href="https://duranta.app/storage/questionbank/1717174124.pdf" class="button full" target="_blank" rel="noopener noreferrer">2024 Question PDF ↗</a>
      </section><section class="panel"><h3>আপনার জন্য পরামর্শ</h3><p class="side-tip mt">ASP.NET, C# ও SQL Server-এ ৪+ বছরের অভিজ্ঞতা থাকায় Practical Coding/SQL অংশে সুবিধা হতে পারে। সময় বেশি দিন DSA complexity, OS, Networking ও General অংশে।</p><button class="button soft full" data-action="goto" data-target="practice">Topic-wise MCQ →</button></section></aside>
    </div>`;
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
  const count = Number(byId("mock-count")?.value || 20);
  const minutes = Number(byId("mock-minutes")?.value || 25);
  const focus = byId("mock-focus")?.value || "All";
  const available = questions.filter(q => focus === "All" || q.category === focus);
  state.activeMock = {
    ids: shuffle(available).slice(0, Math.min(count, available.length)).map(q => q.id),
    answers: {}, index: 0, startedAt: Date.now(), minutes
  };
  ui.mockReviewId = null;
  save();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function finishMock(expired = false) {
  const mock = state.activeMock;
  if (!mock) return;
  const list = mock.ids.map(id => questions.find(q => q.id === id)).filter(Boolean);
  const score = scoreMock(list, mock.answers);
  const attempt = {
    id: `attempt-${Date.now()}`, at: new Date().toISOString(),
    ids: mock.ids, answers: mock.answers, minutes: mock.minutes,
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
    const q = questions.find(item => item.id === mock.ids[index]);
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
    const review = selectedAttempt.ids.map(id => questions.find(q => q.id === id)).filter(Boolean).map((q, i) => {
      const answer = selectedAttempt.answers[q.id];
      const done = Object.hasOwn(selectedAttempt.answers, q.id);
      const correct = done && answer === q.answer;
      return `<div class="review-item"><span class="badge ${correct ? "open" : "review"}">Q${i + 1} · ${correct ? "Correct" : done ? "Incorrect" : "Unanswered"}</span><p><strong>${h(q.prompt)}</strong></p><p>আপনার উত্তর: ${done ? h(q.options[answer]) : "Skipped"}</p><p>সঠিক: <strong>${h(q.options[q.answer])}</strong></p><p class="muted">${h(q.bn)}</p></div>`;
    }).join("");
    return `${head}<div class="result-banner"><span class="eyebrow">EXAM RESULTS</span><strong>${selectedAttempt.score}/${selectedAttempt.total} · ${selectedAttempt.percent}%</strong><p>${selectedAttempt.expired ? "সময় শেষ হয়ে টেস্ট জমা হয়েছে" : "আপনি টেস্ট জমা দিয়েছেন"} · ${new Date(selectedAttempt.at).toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" })}</p></div>
      <div class="heading-actions mb"><button class="button primary" data-action="mock-new">+ New Test</button><button class="button" data-action="goto" data-target="practice">Topic Practice →</button></div><section class="panel"><h3>উত্তর ও ব্যাখ্যা</h3>${review}</section>`;
  }
  return `${head}<div class="section-grid"><section class="panel"><div class="eyebrow">EXAM SIMULATOR</div><h2>শুরু করুন আপনার পরের পরীক্ষা</h2><p class="side-tip">প্রশ্ন এলোমেলো হবে, সময় শেষ হলে স্বয়ংক্রিয়ভাবে জমা হবে। স্কোর ও ভুল উত্তর স্থানীয়ভাবে সংরক্ষিত থাকবে।</p>
    <div class="mock-setup"><div class="form-field"><label for="mock-count">প্রশ্ন সংখ্যা</label><select class="select" id="mock-count"><option>10</option><option selected>20</option><option>40</option></select></div>
    <div class="form-field"><label for="mock-minutes">সময় (মিনিট)</label><select class="select" id="mock-minutes"><option>10</option><option selected>25</option><option>45</option><option>60</option></select></div>
    <div class="form-field"><label for="mock-focus">বিষয়</label><select class="select" id="mock-focus"><option value="All">Technical + General</option><option value="Technical">Technical only</option><option value="General">General only</option></select></div></div>
    <button class="button primary" data-action="start-mock">Start Exam →</button></section>
    <aside class="stack"><section class="panel"><h3>সাম্প্রতিক ফলাফল</h3>${state.attempts.length ? state.attempts.slice(0, 8).map(a => `<div class="attempt-row"><span><strong>${a.score}/${a.total} · ${a.percent}%</strong><br><small>${new Date(a.at).toLocaleDateString("bn-BD", { timeZone: "Asia/Dhaka" })}</small></span><button class="button small" data-action="review-mock" data-id="${h(a.id)}">Review →</button></div>`).join("") : '<p class="side-tip mt">এখনো কোনো মডেল টেস্ট দেননি।</p>'}</section>
    <section class="panel"><h3>পরীক্ষার কৌশল</h3><p class="side-tip mt">সহজ প্রশ্ন আগে দিন। অনুমানভিত্তিক উত্তর দেওয়ার আগে সংশ্লিষ্ট নিয়োগ পরীক্ষায় negative marking আছে কি না যাচাই করুন। এই অ্যাপে প্রতিটি প্রশ্ন ১ নম্বর, negative marking নেই।</p></section></aside></div>`;
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
  const views = { dashboard: renderDashboard, circulars: renderCirculars, practice: renderPractice, written: renderWritten, syllabus: renderSyllabus, mock: renderMock, notes: renderNotes };
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
    const q = questions.find(x => x.id === id);
    if (!q || state.answers[id] || index < 0 || index >= q.options.length) return;
    state.answers[id] = { selected: index, correct: index === q.answer, at: `${bangladeshToday()}T${new Date().toISOString().slice(11)}` };
    save(); render();
  } else if (action === "retry") {
    delete state.answers[id]; save(); render();
  } else if (action === "bookmark") {
    state.bookmarks = state.bookmarks.includes(id) ? state.bookmarks.filter(x => x !== id) : [...state.bookmarks, id];
    save(); render();
  } else if (action === "practice-next" || action === "practice-prev") {
    ui.practiceIndex += action === "practice-next" ? 1 : -1; render();
  } else if (action === "clear-practice-filter") {
    ui.practiceMode = "All"; ui.practiceTopic = "All"; ui.practiceIndex = 0; render();
  } else if (action === "written-toggle") {
    if (ui.expandedWritten.has(id)) ui.expandedWritten.delete(id);
    else ui.expandedWritten.add(id);
    render();
  } else if (action === "written-done") {
    state.writtenDone = state.writtenDone.includes(id) ? state.writtenDone.filter(x => x !== id) : [...state.writtenDone, id];
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
  if (event.target.id === "job-search") {
    const pos = event.target.selectionStart;
    ui.jobSearch = event.target.value;
    render();
    const next = byId("job-search");
    if (next) { next.focus(); next.setSelectionRange(pos, pos); }
  }
});

document.addEventListener("change", event => {
  const element = event.target;
  const id = element.id;
  if (id === "job-sector") { ui.jobSector = element.value; render(); }
  if (id === "job-filter") { ui.jobStatus = element.value; render(); }
  if (id === "show-expired") { ui.showExpired = element.checked; render(); }
  if (id === "practice-topic") { ui.practiceTopic = element.value; ui.practiceIndex = 0; render(); }
  if (id === "practice-mode") { ui.practiceMode = element.value; ui.practiceIndex = 0; render(); }
  if (id === "written-topic") { ui.writtenTopic = element.value; render(); }
  if (id === "daily-goal") { state.dailyGoal = Number(element.value); save(); toast("দৈনিক লক্ষ্য পরিবর্তন হয়েছে।"); render(); }
  if (element.hasAttribute("data-job-status")) {
    const status = element.value;
    if (["none", "saved", "applied", "exam"].includes(status)) {
      state.jobStatuses[element.dataset.jobStatus] = status; save(); render();
    }
  }
  if (id === "restore-input") {
    const file = element.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast("Backup ফাইলটি ২ MB-এর বেশি।"); element.value = ""; return; }
    file.text().then(content => {
      const data = JSON.parse(content);
      if (data.app !== "CSE Prep Desk" || !data.state || data.state.version !== 1)
        throw new Error("এই অ্যাপের সঠিক v1 backup নয়।");
      const restored = normalizeState(data.state);
      if (!confirm("বর্তমান local data বদলে backup ফিরিয়ে আনবেন?")) return;
      state = restored; save(); render(); toast("Backup restore সম্পন্ন।");
    }).catch(() => toast("Backup ফাইল পড়া যায়নি বা format ভুল।")).finally(() => { element.value = ""; });
  }
});

document.addEventListener("submit", event => {
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
