// Offline preparation utilities, deliberately independent from the DOM.
import { shuffle } from "./core.js";
import { trackTopics } from "./data/curriculum.js";

const DAY_MS = 86400000;

export function addStudyDays(date, days) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid study date");
  const time = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(time)) throw new Error("Invalid study date");
  return new Date(time + days * DAY_MS).toISOString().slice(0, 10);
}

// Practical interval ladder. It is a revision aid, not a proven memory model.
export function nextReview(previous, correct, today) {
  const previousStreak = Number.isInteger(previous?.streak) ? previous.streak : 0;
  const streak = correct ? Math.min(previousStreak + 1, 20) : 0;
  const intervals = [1, 3, 7, 14, 30, 60, 90];
  const days = correct ? intervals[Math.min(streak - 1, intervals.length - 1)] : 1;
  return { streak, due: addStudyDays(today, days), last: today, reviews: Math.min(9999, (previous?.reviews || 0) + 1) };
}

export function dueQuestionIds(questionBank, reviewSchedule, today) {
  return new Set(questionBank.filter(q => reviewSchedule?.[q.id]?.due <= today).map(q => q.id));
}

export function topicAnalytics(questionBank, answers = {}, reviewSchedule = {}, today = "9999-12-31") {
  const buckets = new Map();
  for (const question of questionBank) {
    let group = buckets.get(question.topic);
    if (!group) {
      group = { topic: question.topic, total: 0, attempted: 0, correct: 0, due: 0, hard: 0 };
      buckets.set(question.topic, group);
    }
    group.total++;
    if (question.difficulty === "Hard") group.hard++;
    if (answers[question.id]) {
      group.attempted++;
      if (answers[question.id].correct) group.correct++;
    }
    if (reviewSchedule[question.id]?.due <= today) group.due++;
  }
  return [...buckets.values()].map(group => ({
    ...group,
    accuracy: group.attempted ? Math.round(100 * group.correct / group.attempted) : null,
    coverage: Math.round(100 * group.attempted / group.total),
  }));
}

export function recommendedTopics(groups, trackId = "all", limit = 5) {
  const focus = new Set(trackTopics(trackId));
  return groups.filter(group => focus.has(group.topic)).sort((a, b) => {
    const priority = g => (100 - g.coverage) * 0.6 + (g.accuracy === null ? 25 : (100 - g.accuracy) * 0.4) + Math.min(g.due, 10) * 3;
    return priority(b) - priority(a) || a.topic.localeCompare(b.topic);
  }).slice(0, limit);
}

export function createBalancedMock(questionBank, options = {}, random = Math.random) {
  const { count = 50, focus = "All", trackId = "all", difficulty = "All" } = options;
  const preferred = new Set(trackTopics(trackId));
  const pool = questionBank.filter(q =>
    (focus === "All" || q.category === focus) &&
    (difficulty === "All" || q.difficulty === difficulty) &&
    preferred.has(q.topic)
  );
  const byTopic = new Map();
  for (const item of shuffle(pool, random)) {
    if (!byTopic.has(item.topic)) byTopic.set(item.topic, []);
    byTopic.get(item.topic).push(item);
  }
  const groups = shuffle([...byTopic.values()], random);
  const output = [];
  while (output.length < Math.max(0, count)) {
    let added = false;
    for (const items of groups) {
      if (items.length && output.length < count) { output.push(items.pop()); added = true; }
    }
    if (!added) break;
  }
  return shuffle(output, random);
}

export function scoreWithPenalty(questions, answers, penalty = 0) {
  const deduction = [0, 0.25, 0.5].includes(Number(penalty)) ? Number(penalty) : 0;
  const detail = { correct: 0, wrong: 0, skipped: 0, total: questions.length, net: 0, percent: 0 };
  for (const q of questions) {
    if (!Object.hasOwn(answers, q.id)) detail.skipped++;
    else if (Number(answers[q.id]) === q.answer) detail.correct++;
    else detail.wrong++;
  }
  detail.net = Math.round((detail.correct - deduction * detail.wrong) * 100) / 100;
  detail.percent = questions.length ? Math.round(100 * detail.net / questions.length) : 0;
  return detail;
}
