import { generalPrepRows } from "./general-prep.js";
import { banglaSynonyms, banglaAntonyms, englishSynonyms, englishAntonyms } from "./general-lexicon.js";
import { worldFacts, elementFacts } from "./reference-facts.js";

// 1,500+ practice items per subject. An individual vocabulary or reference fact
// is deliberately exercised in multiple recall directions. The repeated recall
// directions are clearly marked as practice variants, not distinct source facts.
export const extendedGeneralRows = [];

const AUTHOR = "Original concept/scenario";
const VARIANT = "Structured practice variation";

function choices(correct, pool, seed) {
  const distinct = [...new Set(pool.map(String).filter(item => item !== String(correct)))];
  const distractors = [];
  for (let i = 0; distractors.length < 3 && i < distinct.length; i++) {
    const candidate = distinct[(seed * 29 + i * 37 + 17) % distinct.length];
    if (!distractors.includes(candidate)) distractors.push(candidate);
  }
  if (distractors.length < 3) {
    for (const item of distinct) {
      if (!distractors.includes(item)) distractors.push(item);
      if (distractors.length === 3) break;
    }
  }
  if (distractors.length < 3) throw new Error("Insufficient unique distractors: " + correct);
  const index = (seed * 7 + 2) % 4;
  const opts = distractors.slice(0, 3);
  opts.splice(index, 0, String(correct));
  return [opts, index];
}

function add(topic, subtopic, difficulty, prompt, answer, wrongPool, en, bn, sourceKind = VARIANT) {
  const [opts, index] = choices(answer, wrongPool, extendedGeneralRows.length);
  extendedGeneralRows.push([topic, difficulty, prompt, opts, index, en, bn, subtopic, sourceKind]);
}

function existingPairs(topic, subtopic) {
  return generalPrepRows.filter(row => row[0] === topic && row[7] === subtopic).map(row => {
    const prompt = row[2];
    const key = topic === "Bangla"
      ? prompt.match(/‘(.+?)’/)?.[1]
      : prompt.match(/^.*?'(.+)'/)?.[1];
    if (!key) throw new Error("Cannot extract original word or phrase: " + prompt);
    return [key, row[3][row[4]]];
  });
}

function expandLexicon(topic, subtype, newPairs, category) {
  const old = existingPairs(topic, subtype);
  const seenKeys = new Set();
  const all = [...old, ...newPairs].filter(([key]) => {
    const normalized = key.toLocaleLowerCase();
    if (seenKeys.has(normalized)) return false;
    seenKeys.add(normalized);
    return true;
  });
  const keys = all.map(([key]) => key);
  const values = all.map(([,value]) => value);
  const valueToKeys = new Map();
  for (const [key,value] of all) {
    valueToKeys.set(value, [...(valueToKeys.get(value) || []), key]);
  }
  const isBn = topic === "Bangla";
  const isOpposite = category === "antonym";
  const isIdiom = category === "idiom";
  const roleBn = isIdiom ? "বাগধারার অর্থ" : isOpposite ? "বিপরীতার্থক" : "সমার্থক";
  const roleEn = isIdiom ? "idiom meaning" : isOpposite ? "antonym" : "synonym";

  all.forEach(([key, value], i) => {
    const en = `The ${roleEn} relationship in this item is: ${key} → ${value}. Review the pair in both directions.`;
    const bn = `এই প্রশ্নে ‘${key}’–এর ${roleBn} হলো ‘${value}’। দুই দিক থেকেই অনুশীলন করুন।`;
    if (i >= old.length) {
      add(topic, subtype, "Medium",
        isBn ? `‘${key}’ শব্দটির ${roleBn} কোনটি?` : isIdiom ? `What is the meaning of the idiom "${key}"?` : `Choose the ${roleEn} of "${key}".`,
        value, values, en, bn, AUTHOR);
    }
    if (valueToKeys.get(value).length === 1) {
      add(topic, subtype, "Medium",
        isBn ? `‘${value}’—কোন শব্দের সঙ্গে এর ${roleBn} সম্পর্ক রয়েছে?` : `Which word or idiom is associated with "${value}" as its ${roleEn}?`,
        key, keys, en, bn);
    }

    const correctPair = `${key} — ${value}`;
    add(topic, subtype, "Hard",
      isBn ? `‘${key}’ দিয়ে শুরু হওয়া কোন শব্দজোড়াটি সঠিক ${roleBn} সম্পর্ক প্রকাশ করে?` : `Choose the correctly matched ${roleEn} pair beginning with "${key}".`,
      correctPair, values.filter(v => v !== value).map(v => `${key} — ${v}`), en, bn);

    if (valueToKeys.get(value).length === 1) {
      const reversePair = `${value} — ${key}`;
      add(topic, subtype, "Hard",
        isBn ? `‘${value}’ দিয়ে শুরু হওয়া কোন উল্টো ${roleBn} শব্দজোড়াটি সঠিক?` : `Choose the correct reverse ${roleEn} pairing beginning with "${value}".`,
        reversePair, keys.filter(k => !valueToKeys.get(value).includes(k)).map(k => `${value} — ${k}`), en, bn);
    }
  });
}

expandLexicon("Bangla", "সমার্থক শব্দ", banglaSynonyms, "synonym");
expandLexicon("Bangla", "বিপরীত শব্দ", banglaAntonyms, "antonym");
expandLexicon("Bangla", "বাগধারা", [], "idiom");
expandLexicon("English", "Synonyms", englishSynonyms, "synonym");
expandLexicon("English", "Antonyms", englishAntonyms, "antonym");
expandLexicon("English", "Idioms and Phrases", [], "idiom");

// Stable factual recall; avoid capital changes, current officials and disputed
// administrative statuses. Reference snapshots are documented in source file.
const worldNames = worldFacts.map(([name]) => name);
const capitals = worldFacts.map(([,capital]) => capital);
const continents = ["Africa","Asia","Europe","North America","South America","Oceania"];
const isoCodes = worldFacts.map(([, , ,iso]) => iso);

worldFacts.forEach(([country, capital, continent, code]) => {
  const en = `Reference facts: ${country} — capital ${capital}; geographic continent ${continent}; ISO alpha-2 code ${code}.`;
  const bn = `${country}-এর রাজধানী ${capital}, মহাদেশ ${continent}, ISO দুই অক্ষরের কোড ${code}।`;
  add("General Knowledge","বিশ্বদেশ ও রাজধানী","Medium",country === "Bangladesh" ? "Which city serves as the capital of Bangladesh?" : `What is the capital of ${country}?`,
    capital,capitals,en,bn,AUTHOR);
  add("General Knowledge","বিশ্বদেশ ও রাজধানী","Medium",`Which country is associated with the capital ${capital}?`,
    country,worldNames,en,bn);
  add("General Knowledge","বিশ্বভূগোল","Easy",`On which continent is ${country} located?`,
    continent,continents,en,bn);
  add("General Knowledge","দেশের ISO কোড","Hard",`What is the ISO 3166-1 alpha-2 code for ${country}?`,
    code,isoCodes,en,bn);
  add("General Knowledge","দেশের ISO কোড","Medium",`The ISO 3166-1 alpha-2 code "${code}" identifies which country?`,
    country,worldNames,en,bn);
});

const elementNames = elementFacts.map(([name]) => name);
const symbols = elementFacts.map(([,symbol]) => symbol);
const atomicNumbers = elementFacts.map(([, ,number]) => String(number));
elementFacts.forEach(([name, symbol, number]) => {
  const en = `The chemical element ${name} has symbol ${symbol} and atomic number ${number}.`;
  const bn = `${name} মৌলের প্রতীক ${symbol}, পারমাণবিক সংখ্যা ${number}।`;
  add("General Knowledge","সাধারণ বিজ্ঞান — মৌল","Medium",`Which element uses the chemical symbol "${symbol}"?`,
    name,elementNames,en,bn,AUTHOR);
  add("General Knowledge","সাধারণ বিজ্ঞান — মৌল","Medium",`What is the chemical symbol of ${name}?`,
    symbol,symbols,en,bn);
  add("General Knowledge","সাধারণ বিজ্ঞান — মৌল","Hard",`Which chemical element has atomic number ${number}?`,
    name,elementNames,en,bn);
  add("General Knowledge","সাধারণ বিজ্ঞান — মৌল","Hard",`What is the atomic number of the element ${name}?`,
    String(number),atomicNumbers,en,bn);
});

const promptKeys = extendedGeneralRows.map(row => row[0] + "\0" + row[2].toLocaleLowerCase());
if (new Set(promptKeys).size !== promptKeys.length) {
  const seen = new Set();
  const duplicates = promptKeys.filter(key => seen.has(key) || (seen.add(key), false));
  throw new Error("Generated general preparation bank has duplicate prompts: " + duplicates.slice(0, 10).join(" | ") + "; total=" + duplicates.length);
}
