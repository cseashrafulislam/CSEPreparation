import test from "node:test";
import assert from "node:assert/strict";
import { technicalAuthoredRows } from "../public/data/technical-authored.js";
import { technicalWritten } from "../public/data/technical-written.js";
import { technicalLabs } from "../public/data/technical-labs.js";
import { questions, writtenQuestions } from "../public/data/questions.js";
import { LABS } from "../public/data/labs.js";

const technicalSubjects = [
  "Data Structures", "DBMS & SQL", "Operating System", "Networking", "OOP & C#",
  "Programming", "Software Engineering", "Security", "Algorithms", "Computer Architecture",
  "Digital Logic", "Compiler Design", "Automata Theory", "Web & APIs", "Linux & DevOps",
];

test("120 genuinely authored technical MCQs cover all 15 subjects with complete, unique answer choices", () => {
  assert.equal(technicalAuthoredRows.length, 120);
  for (const topic of technicalSubjects)
    assert.equal(technicalAuthoredRows.filter(row => row[0] === topic).length, 8, `${topic} lacks coverage`);

  const oldPrompts = new Set(questions.slice(0, 16521).map(q => q.prompt.toLocaleLowerCase().trim()));
  const newPrompts = new Set();
  for (const [topic, difficulty, prompt, options, answer, en, bn, subtopic] of technicalAuthoredRows) {
    assert.ok(technicalSubjects.includes(topic), `Unknown topic ${topic}`);
    assert.ok(["Easy", "Medium", "Hard"].includes(difficulty));
    assert.ok(prompt.length > 45 && prompt.endsWith("?"), `Ambiguous/short prompt: ${prompt}`);
    assert.equal(options.length, 4);
    assert.equal(new Set(options.map(o => o.toLocaleLowerCase().trim())).size, 4, `Repeated option: ${prompt}`);
    assert.ok(options.every(o => o.length > 0));
    assert.ok(Number.isInteger(answer) && answer >= 0 && answer < 4);
    assert.ok(en.length > 45, `Explanation needs reasoning: ${prompt}`);
    assert.ok(bn.length > 18, `Missing Bangla guidance: ${prompt}`);
    assert.ok(subtopic.length > 2);
    const key = prompt.toLocaleLowerCase().trim();
    assert.ok(!oldPrompts.has(key) && !newPrompts.has(key), `Duplicate question: ${prompt}`);
    newPrompts.add(key);
  }

  assert.equal(questions.length, 16641);
  assert.equal(questions[16520].id, "q16521");
  assert.equal(questions[16521].id, "q16522");
  assert.equal(questions.at(-1).id, "q16641");
  assert.ok(questions.slice(16521).every(q => q.category === "Technical" && q.sourceKind === "Original concept/scenario"));
});

test("20 worked written answers append safely with distinct IDs, detailed solutions and rubrics", () => {
  assert.equal(technicalWritten.length, 20);
  assert.equal(new Set(technicalWritten.map(q => q.id)).size, 20);
  assert.ok(technicalSubjects.every(t => technicalWritten.some(q => q.topic === t)), "A technical subject lacks written practice");
  assert.equal(writtenQuestions[1332].id, "ws082");
  assert.equal(writtenQuestions[1333].id, "tw-001");
  assert.equal(writtenQuestions.length, 1353);
  for (const q of technicalWritten) {
    assert.ok(q.prompt.length > 80, `Short task: ${q.id}`);
    assert.ok(q.answer.length > 350, `Reference answer too brief: ${q.id}`);
    assert.ok(q.bn.length > 35, `Bangla hint missing: ${q.id}`);
    assert.ok(Array.isArray(q.rubric) && q.rubric.length === 3);
    assert.equal(q.sourceKind, "Original worked technical answer");
  }
});

test("20 original practical tasks include problem, solution, edge cases and preserve old progress IDs", () => {
  assert.equal(technicalLabs.length, 20);
  assert.equal(new Set(technicalLabs.map(q => q.id)).size, 20);
  assert.equal(LABS[399].id, "case-18-20");
  assert.equal(LABS[400].id, "practical-001");
  assert.equal(LABS.length, 420);
  assert.ok(technicalLabs.filter(q => q.kind === "Coding").length >= 9);
  assert.ok(technicalLabs.filter(q => q.kind === "SQL").length >= 7);
  for (const q of technicalLabs) {
    assert.ok(q.title.length > 10 && q.prompt.length > 80, `Insufficient practical task: ${q.id}`);
    assert.ok(q.hint.length > 40 && q.solution.length > 290 && q.check.length > 45, `Missing worked steps: ${q.id}`);
    assert.ok(q.rubric.length >= 3, `No rubric: ${q.id}`);
    assert.equal(q.sourceKind, "Original worked practical exercise");
  }
});
