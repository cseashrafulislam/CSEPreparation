import { createHash } from "node:crypto";

export const FEEDS = [
  { language: "bn", query: "প্রোগ্রামার নিয়োগ" },
  { language: "bn", query: '"আইসিটি" "নিয়োগ বিজ্ঞপ্তি" সরকারি' },
  { language: "bn", query: '"সফটওয়্যার ইঞ্জিনিয়ার" "চাকরি" বাংলাদেশ' },
  { language: "en", query: 'Bangladesh "assistant programmer" recruitment circular' },
  { language: "en", query: 'Bangladesh "IT officer" recruitment circular' },
  { language: "en", query: 'Bangladesh "software engineer" government job circular' },
  // Leads only: exact eligibility, position-specific vacancy count and deadline
  // cannot be verified from headlines, and must be checked in official PDFs.
  { language: "bn", query: '"যেকোনো বিষয়ে" "স্নাতক" "নিয়োগ"' },
  { language: "bn", query: '"অনার্স" "সরকারি" "নিয়োগ"' },
  { language: "en", query: 'Bangladesh government graduate honours any subject recruitment' }
];

export const feedUrl = ({ language, query }) => {
  const params = new URLSearchParams({ q: `${query} when:30d`, hl: language, gl: "BD", ceid: `BD:${language}` });
  return `https://news.google.com/rss/search?${params}`;
};

export function decodeEntities(value) {
  return String(value).replace(/&#(x[0-9a-f]+|\d+);|&(amp|lt|gt|quot|apos|nbsp);/gi, (match, numeric, named) => {
    if (numeric) {
      const point = numeric[0].toLowerCase() === "x" ? parseInt(numeric.slice(1), 16) : Number(numeric);
      return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : "";
    }
    return ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " })[named.toLowerCase()] || match;
  });
}

const xmlText = (item, tag) => {
  const match = item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!match) return "";
  return decodeEntities(match[1].replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, "$1").replace(/<[^>]+>/g, "")).trim();
};

export const relevantHeadline = text => {
  const technical = /\b(programmer|developer|software engineer|network engineer|ict officer|it officer|information technology|system analyst|computer engineer|database administrator|system administrator|cybersecurity|cyber security|it specialist|ict specialist)\b|প্রোগ্রামার|সফটওয়্যার|আইসিটি|তথ্যপ্রযুক্তি|কম্পিউটার ইঞ্জিনিয়ার|আইটি অফিসার|সিস্টেম এনালিস্ট|নেটওয়ার্ক ইঞ্জিনিয়ার/iu;
  const generalGraduate = /\b(?:graduate|bachelors?|honou?rs|any subject)\b|অনার্স|সম্মান|স্নাতক|যেকোনো বিষয়ে/iu;
  const hiring = /\b(recruitment|recruit|hiring|vacanc(?:y|ies)|job(?:s)?|career|apply|circular|posts?)\b|নিয়োগ|চাকরি|বিজ্ঞপ্তি|শূন্যপদ|আবেদন/iu;
  const notHiring = /\b(arrested|hack(?:ed)?|exam result|admit card|answer key|final result|interview result|protest|terminated)\b|গ্রেফতার|ফলাফল|পরীক্ষার ফল|প্রবেশপত্র|প্রশ্নফাঁস|স্থগিত/iu;
  return (technical.test(text) || generalGraduate.test(text)) && hiring.test(text) && !notHiring.test(text);
};

export function parseFeed(xml, checkedAt = new Date()) {
  if (!/<rss\b|<feed\b/i.test(xml)) throw new Error("Expected RSS or Atom XML");
  const recent = checkedAt.getTime() - 35 * 86400000;
  const results = [];
  for (const [match] of xml.matchAll(/<item\b[^>]*>[\s\S]*?<\/item>/gi)) {
    const headline = xmlText(match, "title").slice(0, 220);
    const url = xmlText(match, "link");
    const publisher = xmlText(match, "source").slice(0, 100) || "News index";
    const published = new Date(xmlText(match, "pubDate"));
    if (!headline || !relevantHeadline(headline) || !Number.isFinite(published.getTime()) || published.getTime() < recent || published.getTime() > checkedAt.getTime() + 86400000) continue;
    let safeUrl;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") continue;
      safeUrl = parsed.toString();
    } catch { continue; }
    const cleanTitle = headline.replace(new RegExp(`\\s+-\\s+${publisher.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"), "").trim();
    results.push({
      id: `discovery-${createHash("sha256").update(safeUrl).digest("hex").slice(0, 16)}`,
      title: cleanTitle,
      publisher,
      url: safeUrl,
      publishedOn: published.toISOString().slice(0, 10),
      foundOn: checkedAt.toISOString().slice(0, 10),
      verification: "unverified",
      note: "সংবাদ-সূচিতে পাওয়া সম্ভাব্য CSE/IT নিয়োগ। অফিসিয়াল বিজ্ঞপ্তি ও আবেদনের শেষ সময় যাচাই না করে আবেদন করবেন না।"
    });
  }
  return results;
}

export function mergeDiscoveries(existing, batches, today, maxItems = 75) {
  const unique = new Map();
  const cutoff = new Date(`${today}T00:00:00Z`).getTime() - 35 * 86400000;
  for (const entry of [...batches.flat(), ...existing]) {
    if (entry?.verification !== "unverified" || !entry.id || !entry.title || !entry.url) continue;
    if (Date.parse(`${entry.publishedOn}T00:00:00Z`) < cutoff) continue;
    const key = entry.title.toLowerCase().replace(/[\W_]+/g, " ").trim();
    if (!unique.has(key)) unique.set(key, entry);
  }
  return [...unique.values()].sort((a,b) => b.publishedOn.localeCompare(a.publishedOn)).slice(0, maxItems);
}
