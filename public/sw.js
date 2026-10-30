const VERSION = "cseprep-v7-academy-general-20261031";
const CORE = [
  "/", "/index.html", "/styles.css", "/app.js", "/core.js", "/preparation-core.js",
  "/data/jobs.js", "/data/discovered.js", "/data/questions.js", "/data/advanced.js", "/data/drills.js",
  "/data/exam-rows.js", "/data/numerical-scenarios.js", "/data/mega-bank.js", "/data/general-prep.js", "/data/general-lexicon.js", "/data/reference-facts.js", "/data/general-extended.js", "/data/expanded-writing.js",
  "/data/expanded-labs.js", "/data/curriculum.js", "/data/master-notes.js", "/data/labs.js", "/previous-core.js",
  "/manifest.webmanifest", "/icon.svg",
  "/icons/icon-192.png", "/icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== VERSION).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(VERSION).then(cache => cache.put("/index.html", copy)));
        }
        return response;
      }).catch(() => caches.match("/index.html")));
    return;
  }

  event.respondWith(fetch(request).then(response => {
    if (response.ok && response.type === "basic") {
      const copy = response.clone();
      event.waitUntil(caches.open(VERSION).then(cache => cache.put(request, copy)));
    }
    return response;
  }).catch(() => caches.match(request)));
});
