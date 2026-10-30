// A user-controlled archive. No uploaded paper is independently certified.
import { safeHttps } from "./core.js";

const clean = (value, limit) => String(value ?? "").trim().slice(0, limit);

function simpleHash(value) {
  let result = 2166136261;
  for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  return (result >>> 0).toString(36);
}

export function validatePreviousItem(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Each previous-paper entry must be an object.");
  const question = clean(raw.question, 1500);
  const organization = clean(raw.organization, 130);
  const examName = clean(raw.examName, 130);
  const sourceUrl = safeHttps(raw.sourceUrl);
  const year = Number(raw.year);
  const type = raw.type === "Written" ? "Written" : raw.type === "MCQ" ? "MCQ" : "";
  if (!question || !organization || !examName || !sourceUrl || !Number.isInteger(year) || year < 1950 || year > new Date().getFullYear() + 1 || !type)
    throw new Error("Provide question, organization, examName, HTTPS sourceUrl, valid year and type=MCQ/Written.");
  const topic = clean(raw.topic, 75) || "General Knowledge";
  const options = type === "MCQ" ? raw.options : null;
  const answer = type === "MCQ" ? Number(raw.answer) : null;
  if (type === "MCQ" && (!Array.isArray(options) || options.length !== 4 || !options.every(o => typeof o === "string" && o.trim() && o.length <= 220) || new Set(options.map(o => o.trim())).size !== 4 || !Number.isInteger(answer) || answer < 0 || answer > 3))
    throw new Error("MCQ entries need four distinct options and answer index 0–3.");
  const id = `prev-${simpleHash(`${sourceUrl}|${year}|${examName}|${question}`)}`;
  return { id, question, organization, examName, sourceUrl, year, type, topic, options: options?.map(o => o.trim()) || null, answer, explanation: clean(raw.explanation, 2000), provenance: "User imported; source not independently authenticated" };
}

export function mergePrevious(existing, uploaded) {
  if (!Array.isArray(uploaded)) throw new Error("Previous-paper JSON must be an array of entries.");
  if (uploaded.length > 2000) throw new Error("Import a maximum of 2,000 entries at once.");
  const merged = new Map(existing.map(item => [item.id, item]));
  for (const item of uploaded) {
    const parsed = validatePreviousItem(item);
    merged.set(parsed.id, parsed);
  }
  if (merged.size > 2000) throw new Error("Local archive limit: 2,000 entries. Export a backup before adding more.");
  return [...merged.values()];
}

export const PREVIOUS_TEMPLATE = [{
  organization: "Example Exam Board (replace)", examName: "Example recruitment paper (replace)",
  year: 2024, topic: "Algorithms", type: "MCQ",
  question: "REPLACE with an accurately transcribed question from a permitted source",
  options: ["Option A", "Option B", "Option C", "Option D"], answer: 0,
  explanation: "Explain the correct choice and cite the page or question number.",
  sourceUrl: "https://example.org/replace-with-original-paper-link"
}];
