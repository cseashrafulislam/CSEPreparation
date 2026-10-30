import test from "node:test";
import assert from "node:assert/strict";
import { questions, writtenQuestions, topics } from "../public/data/questions.js";

test("large diversified question bank has consistent answer keys and explanations", () => {
  assert.ok(questions.length >= 500, `Only ${questions.length} MCQs`);
  assert.ok(writtenQuestions.length >= 50, `Only ${writtenQuestions.length} written prompts`);
  assert.ok(topics.length >= 18, `Only ${topics.length} subjects`);
  const ids = new Set();
  const prompts = new Set();
  for (const q of questions) {
    assert.ok(!ids.has(q.id), `Duplicate ID ${q.id}`);
    ids.add(q.id);
    const normalized = q.prompt.toLocaleLowerCase().trim();
    assert.ok(!prompts.has(normalized), `Duplicate prompt ${q.id}: ${q.prompt}`);
    prompts.add(normalized);
    assert.equal(q.options.length, 4, `Invalid options: ${q.id}`);
    assert.equal(new Set(q.options).size, 4, `Duplicate option: ${q.id}`);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, `Invalid key: ${q.id}`);
    assert.ok(q.explain.length > 15, `Short English explanation: ${q.id}`);
    assert.ok(q.bn.length > 8, `Short Bangla explanation: ${q.id}`);
    assert.ok(["Easy", "Medium", "Hard"].includes(q.difficulty));
  }
  assert.equal(new Set(writtenQuestions.map(q => q.id)).size, writtenQuestions.length);
  for (const q of writtenQuestions) {
    assert.ok(q.prompt.length > 15 && q.answer.length > 35 && q.bn.length > 15, `Incomplete written: ${q.id}`);
  }
});
