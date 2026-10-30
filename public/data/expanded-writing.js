// Written drills built from checked numerical scenario rows and concept outlines.
// They are distinct worked CASES, not 1,000 independently researched essays or past papers.
import { numericalScenarioRows } from "./numerical-scenarios.js";
import { megaRows } from "./mega-bank.js";
import { UNITS } from "./curriculum.js";

const topics = [...new Set([...numericalScenarioRows, ...megaRows].map(row => row[0]))];
const source = [...numericalScenarioRows, ...megaRows];
const grouped = Object.fromEntries(topics.map(topic => [topic, source.filter(row => row[0] === topic)]));
const chosen = [];
let round = 0;
while (chosen.length < 1200) {
  let added = false;
  for (const topic of topics) {
    if (round < grouped[topic].length && chosen.length < 1200) {
      chosen.push(grouped[topic][round]); added = true;
    }
  }
  if (!added) break;
  round++;
}

export const expandedWritten = chosen.map((row, index) => ({
  id: `wv${String(index + 1).padStart(4, "0")}`,
  topic: row[0],
  prompt: `${row[2]} Show your complete method, the assumptions and the final answer without relying on multiple-choice options.`,
  answer: `Worked calculation: ${row[5]} Final result: ${row[3][row[4]]}.`,
  bn: `${row[6]} ধাপে ধাপে সূত্র, হিসাব ও সঠিক একক দেখান।`,
  sourceKind: "Parameterized written numerical case",
  rubric: ["Correct method and applicable formula", "Clear intermediate calculation and units", "Verified final result and assumptions"],
}));

export const synthesisWritten = UNITS.flatMap((unit, index) => [
  {
    id: `ws${String(index * 2 + 1).padStart(3, "0")}`,
    topic: unit.topic,
    prompt: `Long-form technical answer: ${unit.title}. Explain the key concepts; compare at least two relevant techniques; provide a worked example and state a common failure mode.`,
    answer: `${unit.concept}\nRequired points: ${unit.checklist.join("; ")}.\nCommon mistake to avoid: ${unit.pitfalls}.\nWorked exercise: ${unit.exercise}`,
    bn: "সংজ্ঞা, তুলনা, উদাহরণ, complexity/শর্ত এবং সাধারণ ভুলগুলো গুছিয়ে লিখুন।",
    sourceKind: "Original synthesis prompt",
    rubric: ["Accurate explanation and diagrams/example", "Comparison of advantages, limits and complexity", "Common mistakes and practical validation"],
  },
  {
    id: `ws${String(index * 2 + 2).padStart(3, "0")}`,
    topic: unit.topic,
    prompt: `Design-and-debug written exercise on ${unit.title}: ${unit.exercise} Explain your reasoning, assumptions, validation and edge cases.`,
    answer: `Use these principles: ${unit.concept}\nChecklist: ${unit.checklist.join("; ")}.\nAvoid: ${unit.pitfalls}\nThe exercise may admit multiple valid designs; assess the assumptions and correctness of your explanation.`,
    bn: "একাধিক গ্রহণযোগ্য সমাধান থাকতে পারে; যুক্তি, সীমাবদ্ধতা ও প্রমাণ লিখুন।",
    sourceKind: "Original design prompt",
    rubric: ["Requirements and assumptions stated", "Reasoned algorithm/design or derivation", "Correctness checks, limitations and edge cases"],
  },
]);
