import test from "node:test";
import assert from "node:assert/strict";
import { questions, writtenQuestions, topics } from "../public/data/questions.js";
import { EXAM_TRACKS, UNITS, UNIT_BY_ID, trackTopics } from "../public/data/curriculum.js";
import { LABS, LAB_KINDS } from "../public/data/labs.js";
import { nextReview, addStudyDays, dueQuestionIds, topicAnalytics, recommendedTopics, createBalancedMock, scoreWithPenalty } from "../public/preparation-core.js";
import { normalizeState } from "../public/core.js";

test("transparent question volume, lab quality and study curriculum coverage", () => {
  assert.ok(questions.length >= 2000, "Expected expanded question pool");
  assert.ok(questions.filter(q => q.sourceKind === "Original concept/scenario").length >= 300);
  assert.ok(questions.filter(q => q.sourceKind === "Numerical drill variant").length >= 1500);
  assert.ok(writtenQuestions.length >= 50 && topics.length >= 19);
  assert.ok(UNITS.length >= 25 && LABS.length >= 40);
  assert.equal(new Set(UNITS.map(u => u.id)).size, UNITS.length);
  assert.equal(new Set(LABS.map(l => l.id)).size, LABS.length);
  assert.equal(LAB_KINDS.join(","), "Coding,SQL,Written");
  for (const unit of UNITS) {
    assert.deepEqual(UNIT_BY_ID[unit.id], unit);
    assert.ok(topics.includes(unit.topic));
    assert.ok(unit.concept.length > 75 && unit.checklist.length >= 3 && unit.pitfalls.length > 20 && unit.exercise.length > 20);
  }
  for (const lab of LABS) {
    assert.ok(topics.includes(lab.topic));
    assert.ok(lab.prompt.length > 60 && lab.hint.length > 20 && lab.solution.length > 65 && lab.check.length > 20);
    assert.ok(lab.rubric.length >= 3);
  }
  for (const track of EXAM_TRACKS) {
    const selected = trackTopics(track.id);
    assert.ok(selected.length >= 9);
    assert.ok(selected.every(topic => topics.includes(topic)));
  }
});

test("study review ladder and weak-topic analytics", () => {
  assert.equal(addStudyDays("2026-10-30", 2), "2026-11-01");
  const first = nextReview(null, true, "2026-10-30");
  assert.deepEqual(first, { streak: 1, due: "2026-10-31", last: "2026-10-30", reviews: 1 });
  const second = nextReview(first, true, "2026-10-31");
  assert.equal(second.due, "2026-11-03");
  const failed = nextReview(second, false, "2026-11-03");
  assert.equal(failed.streak, 0);
  assert.equal(failed.due, "2026-11-04");
  assert.equal(dueQuestionIds(questions, { [questions[0].id]: failed }, "2026-11-03").size, 0);
  assert.equal(dueQuestionIds(questions, { [questions[0].id]: failed }, "2026-11-04").size, 1);
  const sample = questions.slice(0, 3);
  const answers = { [sample[0].id]: { correct: true }, [sample[1].id]: { correct: false } };
  const groups = topicAnalytics(sample, answers);
  assert.equal(groups.reduce((sum, g) => sum + g.attempted, 0), 2);
  assert.equal(groups.reduce((sum, g) => sum + g.correct, 0), 1);
  assert.ok(recommendedTopics(topicAnalytics(questions, {}), "all", 5).length === 5);
});

test("balanced mock honors track, difficulty, uniqueness and scoring", () => {
  const selected = createBalancedMock(questions, { count: 100, focus: "Technical", trackId: "technical", difficulty: "Hard" }, () => 0.37);
  assert.equal(selected.length, 100);
  assert.equal(new Set(selected.map(q => q.id)).size, 100);
  assert.ok(selected.every(q => q.category === "Technical" && q.difficulty === "Hard" && trackTopics("technical").includes(q.topic)));
  assert.ok(new Set(selected.map(q => q.topic)).size >= 4);
  const qs = questions.slice(0, 3);
  const responses = { [qs[0].id]: qs[0].answer, [qs[1].id]: (qs[1].answer + 1) % 4 };
  assert.deepEqual(scoreWithPenalty(qs, responses, 0.25), { correct: 1, wrong: 1, skipped: 1, total: 3, net: 0.75, percent: 25 });
  assert.deepEqual(scoreWithPenalty([], {}, 0), { correct: 0, wrong: 0, skipped: 0, total: 0, net: 0, percent: 0 });
});

test("legacy backups remain compatible with additional offline progress", () => {
  const state = normalizeState({ version: 1, answers: { q001: { selected: 1, correct: true } }, trackId: "technical",
    unitDone: ["ds-array", "ds-array", 7], labDrafts: { "lab-001": "my code" }, labResults: { "lab-001": "solved", "lab-002": "unknown" },
    writtenDrafts: { w01: "my explanation" }, writtenResults: { w01: "retry" },
    reviewSchedule: { q001: { due: "2026-11-01", streak: 2, reviews: 3 } }, activity: [{ date: "2026-10-30", topic: "Algorithms", correct: true }] });
  assert.equal(state.version, 1);
  assert.deepEqual(state.unitDone, ["ds-array"]);
  assert.equal(state.labDrafts["lab-001"], "my code");
  assert.equal(state.labResults["lab-002"], undefined);
  assert.equal(state.reviewSchedule.q001.due, "2026-11-01");
  assert.equal(state.activity.length, 1);
  assert.equal(normalizeState({ version: 1 }).trackId, "all");
});
