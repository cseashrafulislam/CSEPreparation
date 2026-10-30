import test from "node:test";
import assert from "node:assert/strict";

test("every built-in route renders without a browser dependency", async () => {
  const listeners = {};
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) {
      elements.set(id, {
        id, innerHTML: "", textContent: "", content: "",
        classList: { add() {}, remove() {}, toggle() {} },
        setAttribute() {}, removeAttribute() {}
      });
    }
    return elements.get(id);
  };
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  const originalLocation = globalThis.location;
  const originalStorage = globalThis.localStorage;
  try {
    globalThis.document = {
      getElementById: element, querySelectorAll: () => [],
      querySelector: () => element("meta"), addEventListener: (name, fn) => { listeners[name] = fn; },
      body: { classList: { toggle() {} } }
    };
    globalThis.window = { addEventListener: (name, fn) => { listeners[`window:${name}`] = fn; }, scrollTo() {} };
    globalThis.location = { hash: "#dashboard", protocol: "http:", hostname: "test.invalid" };
    globalThis.localStorage = { getItem: () => null, setItem() {} };
    await import("../public/app.js");
    for (const name of ["dashboard", "circulars", "practice", "written", "syllabus", "mock", "notes"]) {
      globalThis.location.hash = `#${name}`;
      listeners["window:hashchange"]();
      assert.ok(element("app").innerHTML.length > 300, `Empty ${name} page`);
    }
    assert.match(element("app").innerHTML, /Backup/);
  } finally {
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
    globalThis.location = originalLocation;
    globalThis.localStorage = originalStorage;
  }
});
