import test from "node:test";
import assert from "node:assert/strict";
import { officialJobs } from "../public/data/jobs.js";
import { jobPhase, qualifiesForTrack, safeHttps } from "../public/core.js";

test("curated circulars use a per-position, not organisation-level, vacancy filter", () => {
  assert.equal(new Set(officialJobs.map(job => job.id)).size, officialJobs.length, "unique tracking IDs");
  for (const job of officialJobs) {
    assert.ok(Number.isInteger(job.vacancies) && job.vacancies > 0, job.id);
    assert.ok(["cse", "honours"].includes(job.eligibility), job.id);
    if (job.eligibility === "honours") assert.ok(job.vacancies >= 30, job.id);
    assert.ok(safeHttps(job.url), job.id + " has a valid application link");
    assert.ok(safeHttps(job.circularUrl), job.id + " has a valid circular link");
    assert.ok(job.qualification?.length > 15, job.id + " describes degree eligibility");
  }
});

test("CSE positions can have 1 post, while Honours requires 30 or more per position", () => {
  assert.ok(officialJobs.some(job => job.eligibility === "cse" && job.vacancies === 1));
  assert.ok(officialJobs.some(job => job.eligibility === "honours" && job.vacancies === 31));
  assert.ok(officialJobs.every(job => job.eligibility === "cse" || job.vacancies >= 30));
  assert.ok(officialJobs.some(job => job.id === "bogmc-am-admin-2026" && job.vacancies === 97));
  assert.ok(officialJobs.some(job => job.id === "bdpost-inspector-2026" && job.vacancies === 31));
  const general = officialJobs.find(job => job.id === "bdpost-inspector-2026");
  const oneSeat = officialJobs.find(job => job.id === "bpsc-programmer-2026");
  assert.equal(qualifiesForTrack(general, "Honours"), true);
  assert.equal(qualifiesForTrack(general, "CSE"), true, "BSc CSE can apply to eligible any-subject Honours posts");
  assert.equal(qualifiesForTrack(oneSeat, "CSE"), true);
  assert.equal(qualifiesForTrack(oneSeat, "Honours"), false);
  assert.equal(qualifiesForTrack({ eligibility: "honours", vacancies: 29 }, "CSE"), false);
  assert.equal(qualifiesForTrack({ eligibility: "honours", vacancies: 30 }, "Honours"), true);
  assert.equal(qualifiesForTrack({ eligibility: "cse", vacancies: 1 }, "CSE"), true);

});

test("local cutoff closes applications on the same Bangladesh calendar date", () => {
  const job = { deadline: "2026-11-12", deadlineTime: "16:59:59" };
  assert.equal(jobPhase(job, "2026-11-12", new Date("2026-11-12T10:59:59.000Z")), "urgent");
  assert.equal(jobPhase(job, "2026-11-12", new Date("2026-11-12T11:00:00.000Z")), "closed");
  assert.equal(jobPhase(job, "2026-11-13", new Date("2026-11-12T11:00:00.000Z")), "closed");
});

test("source disagreements are disclosed rather than silently presenting a single certain count", () => {
  const pending = officialJobs.filter(job => job.sourceStatus === "count-disputed");
  for (const job of pending) {
    assert.ok(job.vacancies >= 30, job.id);
    assert.ok(job.vacanciesDisplay && job.note.includes("মূল PDF"), job.id);
  }
});
