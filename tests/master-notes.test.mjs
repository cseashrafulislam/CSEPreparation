import test from "node:test";
import assert from "node:assert/strict";
import { EXAM_TRACKS, UNITS } from "../public/data/curriculum.js";
import { MASTER_NOTES } from "../public/data/master-notes.js";
import { questions, writtenQuestions } from "../public/data/questions.js";

test("all study chapters have distinct, usable worked lessons and recall questions", () => {
  assert.equal(UNITS.length, 41);
  assert.deepEqual(new Set(UNITS.map(u => u.id)).size, UNITS.length);
  assert.deepEqual(new Set(Object.keys(MASTER_NOTES)).size, UNITS.length);
  for (const unit of UNITS) {
    const entry = MASTER_NOTES[unit.id];
    assert.ok(entry, "Missing master note: " + unit.id);
    assert.ok(entry.rule.length >= 90, "Shallow lesson: " + unit.id);
    assert.ok(entry.question.length >= 25 && entry.solution.length >= 75, "Missing worked answer: " + unit.id);
    assert.ok(entry.recall.length >= 20 && entry.answer.length >= 15, "Missing recall key: " + unit.id);
    assert.ok(unit.checklist.length >= 3 && unit.exercise.length > 20);
  }
  assert.equal(new Set(UNITS.map(u => u.topic)).size, 19);
  assert.ok(EXAM_TRACKS.every(track => track.focus.some(topic => UNITS.some(unit => unit.topic === topic))));
});

test("appended chapters and written tasks preserve existing progress identifiers", () => {
  assert.equal(UNITS[0].id, "ds-array");
  assert.equal(UNITS[25].id, "gk");
  assert.equal(UNITS[26].id, "bangla-sandhi");
  assert.equal(writtenQuestions.length, 1333);
  assert.ok(writtenQuestions.some(q => q.id === "ws001"));
  assert.ok(writtenQuestions.some(q => q.id === "ws082"));
  assert.equal(questions.length, 12562);
  assert.equal(questions[11979].id, "q11980");
});
