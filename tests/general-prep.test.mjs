import test from "node:test";
import assert from "node:assert/strict";
import { questions } from "../public/data/questions.js";
import { generalPrepRows } from "../public/data/general-prep.js";
import { extendedGeneralRows } from "../public/data/general-extended.js";
import { banglaSynonyms, banglaAntonyms, englishSynonyms, englishAntonyms } from "../public/data/general-lexicon.js";
import { worldFacts, elementFacts } from "../public/data/reference-facts.js";
import { createBalancedMock } from "../public/preparation-core.js";

test("Bangla, English and GK each have at least 1,500 separately answerable practice prompts", () => {
  const targets = { Bangla: 1500, English: 1500, "General Knowledge": 1500 };
  for (const [topic, expectedMinimum] of Object.entries(targets)) {
    const all = questions.filter(q => q.topic === topic);
    assert.ok(all.length >= expectedMinimum, topic + " has only " + all.length + " questions");
    assert.ok(all.every(q => q.sourceKind === "Original concept/scenario" || q.sourceKind === "Structured practice variation"));
    assert.ok(new Set(all.map(q => q.prompt.toLocaleLowerCase().trim())).size === all.length, topic + " has repeated prompts");
    assert.ok(all.some(q => q.difficulty === "Hard"), topic + " has no hard questions");
    assert.ok(all.some(q => q.subtopic), topic + " lacks fine-grained topics");
    assert.ok(all.filter(q => q.sourceKind === "Original concept/scenario").length >= 400, topic + " has too few independent factual/lexical concepts");
    for (const q of all) {
      assert.equal(q.options.length, 4);
      assert.equal(new Set(q.options).size, 4, q.id + " repeated options");
      assert.ok(q.options[q.answer]);
      assert.ok(q.explain?.length > 15 && q.bn?.length > 8);
    }
  }
});

test("new general bank is original material and preserves earlier saved ID sequence", () => {
  assert.equal(generalPrepRows.length, 583);
  assert.equal(extendedGeneralRows.length, 3959);
  assert.equal(questions.length, 16_521);
  assert.equal(questions[11_978].id, "q11979");
  assert.equal(questions[11_979].id, "q11980");
  assert.equal(questions[12_561].id, "q12562");
  assert.equal(questions[12_562].id, "q12563");
  assert.equal(questions[11_979].sourceKind, "Original concept/scenario");
  assert.equal(questions.filter(q => q.sourceKind === "Numerical drill variant").length, 11_635);
  assert.equal(questions.filter(q => q.sourceKind === "Original concept/scenario").length, 1631);
  assert.equal(questions.filter(q => q.sourceKind === "Structured practice variation").length, 3255);
  for (const row of generalPrepRows) {
    assert.ok(["Bangla", "English", "General Knowledge"].includes(row[0]));
    assert.ok(row[7]?.length > 3);
    assert.equal(row[3].length, 4);
    assert.equal(new Set(row[3]).size, 4);
    assert.ok(row[3][row[4]]);
    assert.ok(row[5].length > 15 && row[6].length > 8);
  }
});

test("lexical source and reference facts have stable independent keys", () => {
  for (const pairs of [banglaSynonyms, banglaAntonyms, englishSynonyms, englishAntonyms]) {
    assert.ok(pairs.length >= 90);
    assert.ok(pairs.every(([key, value]) => key && value && key !== value));
  }
  assert.ok(worldFacts.length >= 170);
  assert.equal(new Set(worldFacts.map(f => f[0])).size, worldFacts.length);
  assert.equal(new Set(worldFacts.map(f => f[1])).size, worldFacts.length);
  assert.equal(new Set(worldFacts.map(f => f[3])).size, worldFacts.length);
  assert.equal(elementFacts.length, 118);
  assert.deepEqual(elementFacts[0], ["Hydrogen", "H", 1]);
  assert.deepEqual(elementFacts[117], ["Oganesson", "Og", 118]);
});

test("mock creation separates recall variants from authored facts and numerical drills", () => {
  for (const source of ["Authored", "Structured", "Variant"]) {
    const expected = { Authored: "Original concept/scenario", Structured: "Structured practice variation", Variant: "Numerical drill variant" }[source];
    const sample = createBalancedMock(questions, { count: 20, source, trackId: "all" }, () => 0.23);
    assert.equal(sample.length, 20);
    assert.ok(sample.every(q => q.sourceKind === expected));
  }
});
