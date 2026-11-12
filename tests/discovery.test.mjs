import test from "node:test";
import assert from "node:assert/strict";
import { parseFeed, mergeDiscoveries, relevantHeadline, feedUrl, FEEDS } from "../scripts/discovery-core.mjs";

test("RSS index accepts recent CSE recruitment leads and rejects non-hiring headlines", () => {
  const xml = `<rss><channel>
    <item><title>Assistant Programmer recruitment circular Bangladesh - News Desk</title><link>https://news.google.com/rss/articles/abc</link><pubDate>Wed, 28 Oct 2026 10:00:00 GMT</pubDate><source url="https://news.example">News Desk</source></item>
    <item><title>Programmer arrested after hacking incident - Daily Desk</title><link>https://news.google.com/rss/articles/def</link><pubDate>Thu, 29 Oct 2026 10:00:00 GMT</pubDate><source>Daily Desk</source></item>
    <item><title>Assistant Programmer recruitment circular Bangladesh - News Desk</title><link>http://insecure.example/item</link><pubDate>Wed, 28 Oct 2026 10:00:00 GMT</pubDate><source>News Desk</source></item>
    <item><title>Assistant Programmer recruitment circular Bangladesh</title><link>https://news.google.com/rss/articles/old</link><pubDate>Mon, 01 Jun 2026 10:00:00 GMT</pubDate></item>
  </channel></rss>`;
  const items = parseFeed(xml, new Date("2026-10-30T00:00:00Z"));
  assert.equal(items.length, 1);
  assert.equal(items[0].title, "Assistant Programmer recruitment circular Bangladesh");
  assert.equal(items[0].verification, "unverified");
  assert.equal(items[0].publishedOn, "2026-10-28");
  const merged = mergeDiscoveries(items, [items], "2026-10-30");
  assert.equal(merged.length, 1);
  assert.ok(relevantHeadline("সরকারি প্রতিষ্ঠানে সহকারী প্রোগ্রামার নিয়োগ বিজ্ঞপ্তি"));
  assert.ok(!relevantHeadline("প্রোগ্রামার নিয়োগ পরীক্ষার ফলাফল প্রকাশ"));
  assert.equal(FEEDS.length, 9);
  assert.ok(relevantHeadline("যেকোনো বিষয়ে স্নাতক নিয়োগ বিজ্ঞপ্তি"));
  assert.ok(relevantHeadline("Government graduate honours recruitment circular"));
  assert.ok(!relevantHeadline("Graduate admission results published"));
  assert.ok(feedUrl(FEEDS[0]).startsWith("https://news.google.com/rss/search?"));
});
