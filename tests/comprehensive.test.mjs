import test from "node:test";
import assert from "node:assert/strict";
import { questions, writtenQuestions, topics } from "../public/data/questions.js";
import { megaRows, SCENARIO_FAMILIES } from "../public/data/mega-bank.js";
import { LABS } from "../public/data/labs.js";
import { expandedLabs } from "../public/data/expanded-labs.js";
import { EXAM_TRACKS } from "../public/data/curriculum.js";
import { createBalancedMock, mockTopicBreakdown } from "../public/preparation-core.js";
import { mergePrevious, validatePreviousItem, PREVIOUS_TEMPLATE } from "../public/previous-core.js";

test("large bank passes count thresholds with honest provenance breakdown", () => {
  assert.ok(questions.length >= 10000);
  assert.ok(writtenQuestions.length >= 1000);
  assert.ok(LABS.length >= 300);
  assert.ok(topics.length >= 19);
  assert.ok(EXAM_TRACKS.length >= 8);
  assert.equal(SCENARIO_FAMILIES.length, 30);
  assert.equal(SCENARIO_FAMILIES.reduce((s, f) => s + f.count, 0), megaRows.length);
  assert.ok(questions.filter(q => q.sourceKind === "Original concept/scenario").length >= 300);
  assert.ok(questions.filter(q => q.sourceKind === "Numerical drill variant").length > 9500);
  assert.ok(writtenQuestions.some(q => q.sourceKind === "Parameterized written numerical case"));
  assert.ok(expandedLabs.every(l => l.sourceKind === "Parameterized practical scenario"));
  for (const row of megaRows) {
    assert.equal(row[3][row[4]], String(row[3][row[4]]));
    assert.equal(new Set(row[3]).size, 4);
    assert.ok(row[5].length > 20);
  }
});

test("exam-wise authored-only mock selects within focus and reports weaknesses", () => {
  const paper = createBalancedMock(questions, { count: 50, trackId: "buet", source: "Authored", focus: "Technical" }, () => 0.31);
  assert.ok(paper.length > 0);
  assert.ok(paper.every(q => q.sourceKind === "Original concept/scenario"));
  assert.ok(paper.every(q => EXAM_TRACKS.find(t => t.id === "buet").focus.includes(q.topic)));
  const answers = { [paper[0].id]: paper[0].answer, [paper[1].id]: (paper[1].answer + 1) % 4 };
  const breakdown = mockTopicBreakdown(paper, answers);
  assert.equal(breakdown.reduce((s, g) => s + g.correct, 0), 1);
  assert.equal(breakdown.reduce((s, g) => s + g.wrong, 0), 1);
  assert.equal(breakdown.reduce((s, g) => s + g.skipped, 0), paper.length - 2);
});

test("previous question archive strictly validates source and merges duplicates", () => {
  const item = validatePreviousItem(PREVIOUS_TEMPLATE[0]);
  assert.equal(item.provenance, "User imported; source not independently authenticated");
  assert.equal(item.type, "MCQ");
  assert.equal(mergePrevious([], [PREVIOUS_TEMPLATE[0], PREVIOUS_TEMPLATE[0]]).length, 1);
  assert.throws(() => validatePreviousItem({ ...PREVIOUS_TEMPLATE[0], sourceUrl: "javascript:alert(1)" }), /HTTPS/);
  assert.throws(() => validatePreviousItem({ ...PREVIOUS_TEMPLATE[0], options: ["same", "same", "C", "D"] }), /distinct/);
  assert.throws(() => validatePreviousItem({ ...PREVIOUS_TEMPLATE[0], answer: 4 }), /index/);
  assert.throws(() => mergePrevious([], { invalid: true }), /array/);
});
