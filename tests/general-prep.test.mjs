import test from "node:test";
import assert from "node:assert/strict";
import { questions } from "../public/data/questions.js";
import { generalPrepRows } from "../public/data/general-prep.js";

test("Bangla, English and GK have meaningful original-question coverage", () => {
  const targets = { Bangla: 225, English: 252, "General Knowledge": 156 };
  for (const [topic, expectedMinimum] of Object.entries(targets)) {
    const all = questions.filter(q => q.topic === topic);
    assert.ok(all.length >= expectedMinimum, topic + " has only " + all.length + " questions");
    assert.ok(all.every(q => q.sourceKind === "Original concept/scenario"), topic + " contains mislabeled drill variants");
    assert.ok(new Set(all.map(q => q.prompt.toLocaleLowerCase().trim())).size === all.length, topic + " has repeated prompts");
    assert.ok(all.some(q => q.difficulty === "Hard"), topic + " has no hard questions");
    assert.ok(all.some(q => q.subtopic), topic + " lacks fine-grained topics");
  }
});

test("new general bank is original material and preserves earlier saved ID sequence", () => {
  assert.equal(generalPrepRows.length, 583);
  assert.equal(questions.length, 12_562);
  assert.equal(questions[11_978].id, "q11979");
  assert.equal(questions[11_979].id, "q11980");
  assert.equal(questions[11_979].sourceKind, "Original concept/scenario");
  assert.equal(questions.filter(q => q.sourceKind === "Numerical drill variant").length, 11_635);
  assert.equal(questions.filter(q => q.sourceKind === "Original concept/scenario").length, 927);
  for (const row of generalPrepRows) {
    assert.ok(["Bangla", "English", "General Knowledge"].includes(row[0]));
    assert.ok(row[7]?.length > 3);
    assert.equal(row[3].length, 4);
    assert.equal(new Set(row[3]).size, 4);
    assert.ok(row[3][row[4]]);
    assert.ok(row[5].length > 15 && row[6].length > 8);
  }
});
