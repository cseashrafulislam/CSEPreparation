import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_STATE, normalizeState, saveState, loadState, daysRemaining, jobPhase, escapeHtml, safeHttps, scoreMock, shuffle, validateCustomJob, dailyPracticeCount } from "../public/core.js";
import { officialJobs } from "../public/data/jobs.js";
import { questions, writtenQuestions } from "../public/data/questions.js";

test("question bank is unique, scored correctly, and has bilingual explanations", () => {
  const ids = questions.map(q => q.id);
  assert.equal(ids.length, new Set(ids).size);
  assert.ok(questions.length >= 70);
  for (const q of questions) {
    assert.equal(q.options.length, 4);
    assert.ok(q.answer >= 0 && q.answer < 4);
    assert.ok(q.explain.length > 10 && q.bn.length > 10);
  }
  assert.ok(writtenQuestions.length >= 15);
  assert.equal(scoreMock(questions.slice(0, 3), {
    [questions[0].id]: questions[0].answer,
    [questions[1].id]: (questions[1].answer + 1) % 4
  }).correct, 1);
});

test("deadline logic respects Bangladesh date and expires after the deadline", () => {
  assert.equal(daysRemaining("2026-11-07", "2026-10-30"), 8);
  assert.equal(daysRemaining("2026-10-30", "2026-10-30"), 0);
  assert.equal(daysRemaining("2026-10-29", "2026-10-30"), -1);
  assert.equal(jobPhase({ deadline: "2026-10-30" }, "2026-10-30"), "urgent");
  assert.equal(jobPhase({ deadline: "2026-10-29" }, "2026-10-30"), "closed");
  for (const job of officialJobs) assert.ok(safeHttps(job.url) && safeHttps(job.circularUrl));
});

test("backup normalization tolerates invalid shape but keeps personal data", () => {
  const raw = { ...DEFAULT_STATE, dailyGoal: 10000, theme: "bad", bookmarks: ["q001"], notes: [{ id: "n1", text: "hello", at: "2026-10-30T10:00:00Z" }] };
  const clean = normalizeState(raw);
  assert.equal(clean.dailyGoal, 100);
  assert.equal(clean.theme, "light");
  assert.deepEqual(clean.bookmarks, ["q001"]);
  assert.equal(clean.notes[0].text, "hello");
  assert.throws(() => normalizeState(null));
  const memory = new Map();
  const storage = { getItem: key => memory.get(key) || null, setItem: (k, v) => memory.set(k, v) };
  assert.equal(saveState(clean, storage), true);
  assert.equal(loadState(storage).notes[0].text, "hello");
});

test("URLs and custom job inputs are validated", () => {
  assert.equal(safeHttps("javascript:alert(1)"), "");
  assert.equal(safeHttps("http://example.com"), "");
  assert.match(escapeHtml('<img src=x onerror="a">'), /&lt;img/);
  assert.throws(() => validateCustomJob({ title: "X", organization: "Y", deadline: "2026-13-99", url: "https://example.com" }));
  assert.throws(() => validateCustomJob({ title: "X", organization: "Y", deadline: "2026-11-07", url: "javascript:abc" }));
  assert.equal(validateCustomJob({ title: "X", organization: "Y", deadline: "2026-11-07", url: "https://example.com" }).sector, "Other");
});

test("mock shuffling preserves questions and daily counter reads local date", () => {
  const values = shuffle([1,2,3,4,5], () => 0);
  assert.deepEqual([...values].sort(), [1,2,3,4,5]);
  assert.equal(dailyPracticeCount({ a: { at: "2026-10-30T12:00Z" }, b: { at: "2026-10-29T13:00Z" } }, "2026-10-30"), 1);
});
