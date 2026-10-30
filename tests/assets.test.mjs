import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const publicDir = resolve("public");

test("all local PWA manifest icons and core offline assets exist", () => {
  const manifest = JSON.parse(readFileSync(resolve(publicDir, "manifest.webmanifest"), "utf8"));
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/#dashboard");
  for (const icon of manifest.icons) {
    assert.ok(existsSync(resolve(publicDir, icon.src.slice(1))), `Missing ${icon.src}`);
    assert.equal(icon.type, "image/png");
  }
  const serviceWorker = readFileSync(resolve(publicDir, "sw.js"), "utf8");
  for (const asset of ["/", "/index.html", "/styles.css", "/app.js", "/core.js", "/data/jobs.js", "/data/discovered.js", "/data/questions.js", "/data/advanced.js", "/data/drills.js", "/manifest.webmanifest", "/icon.svg", "/icons/icon-192.png", "/icons/icon-512.png"]) {
    assert.ok(serviceWorker.includes(`"${asset}"`), `Not cached by SW: ${asset}`);
    if (asset !== "/") assert.ok(existsSync(resolve(publicDir, asset.slice(1))), `Missing ${asset}`);
  }
});

test("the app is dependency-free and contains no paid platform bindings", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  assert.equal(pkg.dependencies, undefined);
  const html = readFileSync(resolve(publicDir, "index.html"), "utf8");
  assert.ok(html.includes('href="/manifest.webmanifest"'));
  assert.ok(html.includes('type="module" src="/app.js"'));
  assert.ok(html.includes('id="app"'));
  assert.ok(!html.includes("<script src=\"https://"));
  assert.ok(existsSync(resolve(publicDir, "_headers")));
});
