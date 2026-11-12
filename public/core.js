export const STORAGE_KEY = "cseprep.personal.v1";

export const DEFAULT_STATE = {
  version: 1,
  theme: "light",
  dailyGoal: 15,
  answers: {},
  bookmarks: [],
  writtenDone: [],
  jobStatuses: {},
  customJobs: [],
  attempts: [],
  activeMock: null,
  notes: [],
  trackId: "all",
  unitDone: [],
  labDrafts: {},
  labResults: {},
  writtenDrafts: {},
  writtenResults: {},
  reviewSchedule: {},
  activity: [],
  previousQuestions: [],
  previousDone: [],
};

const clone = value => JSON.parse(JSON.stringify(value));

export function normalizeState(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Invalid backup format");
  const result = { ...clone(DEFAULT_STATE), ...input, version: 1 };
  result.theme = result.theme === "dark" ? "dark" : "light";
  result.dailyGoal = Math.max(5, Math.min(100, Number(result.dailyGoal) || 15));
  result.answers = result.answers && typeof result.answers === "object" && !Array.isArray(result.answers) ? result.answers : {};
  for (const key of ["bookmarks", "writtenDone", "customJobs", "attempts", "notes", "unitDone", "activity", "previousQuestions", "previousDone"])
    result[key] = Array.isArray(result[key]) ? result[key].slice(0, 2000) : [];
  result.trackId = ["all", "technical", "bank", "developer", "buet", "govt", "network", "academic"].includes(result.trackId) ? result.trackId : "all";
  result.unitDone = [...new Set(result.unitDone.filter(item => typeof item === "string" && item.length < 70))];
  for (const key of ["labDrafts", "writtenDrafts"]) {
    const data = result[key] && typeof result[key] === "object" && !Array.isArray(result[key]) ? result[key] : {};
    result[key] = Object.fromEntries(Object.entries(data).slice(0, 1500)
      .filter(([id, value]) => id.length <= 80 && typeof value === "string")
      .map(([id, value]) => [id, value.slice(0, 10000)]));
  }
  for (const key of ["labResults", "writtenResults"]) {
    const data = result[key] && typeof result[key] === "object" && !Array.isArray(result[key]) ? result[key] : {};
    result[key] = Object.fromEntries(Object.entries(data).slice(0, 1500)
      .filter(([id, rating]) => id.length <= 80 && ["solved", "retry"].includes(rating)));
  }
  const review = result.reviewSchedule && typeof result.reviewSchedule === "object" && !Array.isArray(result.reviewSchedule) ? result.reviewSchedule : {};
  result.reviewSchedule = Object.fromEntries(Object.entries(review).slice(0, 30000)
    .filter(([id, entry]) => id.length < 80 && entry && /^\d{4}-\d{2}-\d{2}$/.test(entry.due))
    .map(([id, entry]) => [id, {
      due: entry.due,
      last: typeof entry.last === "string" ? entry.last.slice(0, 10) : entry.due,
      streak: Number.isInteger(entry.streak) ? Math.max(0, Math.min(20, entry.streak)) : 0,
      reviews: Number.isInteger(entry.reviews) ? Math.max(0, Math.min(9999, entry.reviews)) : 0
    }]));
  result.activity = result.activity.filter(entry => entry && /^\d{4}-\d{2}-\d{2}$/.test(entry.date) && typeof entry.topic === "string")
    .map(entry => ({ date: entry.date, topic: entry.topic.slice(0, 80), correct: Boolean(entry.correct) })).slice(-2000);
  result.customJobs = result.customJobs.filter(j => j && typeof j === "object").flatMap(job => {
    try { return [validateCustomJob(job)]; } catch { return []; }
  });
  result.notes = result.notes.filter(n => typeof n?.text === "string" && Number.isFinite(Date.parse(n?.at))).map(n => ({
    id: String(n.id || Date.now()), text: n.text.slice(0, 2000), at: n.at
  }));
  result.attempts = result.attempts.filter(a => a && Array.isArray(a.ids) && typeof a.at === "string" && Number.isFinite(Date.parse(a.at))).slice(0, 60);
  result.previousQuestions = result.previousQuestions.filter(item => item && typeof item === "object" && !Array.isArray(item) && /^prev-[a-z0-9-]{1,80}$/.test(item.id || "") && typeof item.question === "string" && item.question.length <= 1500 && safeHttps(item.sourceUrl)).slice(0, 2000);
  result.previousDone = [...new Set(result.previousDone.filter(id => typeof id === "string" && /^prev-[a-z0-9-]{1,80}$/.test(id)))];
  result.jobStatuses = result.jobStatuses && typeof result.jobStatuses === "object" && !Array.isArray(result.jobStatuses) ? result.jobStatuses : {};
  result.activeMock = result.activeMock && typeof result.activeMock === "object" && Array.isArray(result.activeMock.ids) ? result.activeMock : null;
  return result;
}

export function loadState(storage = globalThis.localStorage) {
  try {
    const value = storage.getItem(STORAGE_KEY);
    return value ? normalizeState(JSON.parse(value)) : clone(DEFAULT_STATE);
  } catch {
    return clone(DEFAULT_STATE);
  }
}

export function saveState(state, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
    return true;
  } catch {
    return false;
  }
}

export function bangladeshToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(now);
  const part = type => parts.find(p => p.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function daysRemaining(isoDate, today = bangladeshToday()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const date = Date.parse(`${isoDate}T00:00:00Z`);
  const current = Date.parse(`${today}T00:00:00Z`);
  return Number.isFinite(date) && Number.isFinite(current) ? Math.round((date - current) / 86400000) : null;
}

export function jobPhase(job, today = bangladeshToday(), now = new Date()) {
  const days = daysRemaining(job.deadline, today);
  if (days === null) return "unknown";
  if (days < 0) return "closed";
  // A deadline can finish during its calendar day, in Bangladesh local time.
  // Explicit 'today' arguments in existing tests/flows retain date-only semantics
  // unless 'now' falls on that same local date.
  if (days === 0 && /^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$/.test(job.deadlineTime || "") && today === bangladeshToday(now)) {
    const clock = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
    }).format(now);
    if (clock > job.deadlineTime) return "closed";
  }
  if (job.opens && job.opens > today) return "upcoming";
  return days <= 5 ? "urgent" : "open";
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

export function safeHttps(url) {
  try {
    const value = new URL(url);
    return value.protocol === "https:" ? value.toString() : "";
  } catch {
    return "";
  }
}

export function shuffle(items, random = Math.random) {
  const values = [...items];
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

export function scoreMock(questions, answers) {
  let correct = 0;
  for (const question of questions)
    if (Number(answers[question.id]) === question.answer && Object.hasOwn(answers, question.id))
      correct++;
  return { correct, total: questions.length, percent: questions.length ? Math.round(correct * 100 / questions.length) : 0 };
}

export function validateCustomJob(input) {
  const title = String(input.title ?? "").trim().slice(0, 130);
  const organization = String(input.organization ?? "").trim().slice(0, 130);
  const deadline = String(input.deadline ?? "").trim();
  const url = safeHttps(String(input.url ?? ""));
  if (!title || !organization || !/^\d{4}-\d{2}-\d{2}$/.test(deadline) || !Number.isFinite(Date.parse(`${deadline}T00:00:00Z`)) || new Date(`${deadline}T00:00:00Z`).toISOString().slice(0, 10) !== deadline || !url)
    throw new Error("পদ, প্রতিষ্ঠান, শেষ তারিখ ও বৈধ https লিংক দিতে হবে।");
  return {
    id: String(input.id || `own-${Date.now()}`),
    title, organization, deadline, url,
    circularUrl: safeHttps(input.circularUrl || "") || url,
    sector: ["Government", "Semi-government", "Bank", "NGO", "Other"].includes(input.sector) ? input.sector : "Other",
    vacancies: Number.isFinite(Number(input.vacancies)) && Number(input.vacancies) > 0 ? Math.floor(Number(input.vacancies)) : null,
    note: String(input.note ?? "").trim().slice(0, 400),
    verifiedOn: null,
    custom: true,
  };
}

export function dailyPracticeCount(answers, today = bangladeshToday(), activity = []) {
  if (activity?.length) return activity.filter(value => value.date === today).length;
  return Object.values(answers).filter(value => value?.at?.slice(0, 10) === today).length;
}
