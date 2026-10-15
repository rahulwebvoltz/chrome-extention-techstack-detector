// Phase 1/2 behaviour that later phases must not break.
import { test } from "node:test";
import assert from "node:assert/strict";
import { isRestrictedUrl, formatRelativeTime } from "../src/utils/url.js";
import { MSG, ERROR, ok, fail } from "../src/shared/messages.js";
import { extractVersion, pickVersion } from "../src/detector/engine/patterns.js";
import { buildProbe } from "../src/detector/engine/probe.js";
import { compileRule } from "../src/detector/engine/matcher.js";
import { probeMainWorld } from "../src/detector/scanners/jsScanner.js";

test("restricted pages are recognised", () => {
  for (const url of [
    "chrome://extensions",
    "chrome-extension://abc/index.html",
    "edge://settings",
    "about:blank",
    "view-source:https://x.com",
    "file:///C:/a.html",
    "https://chromewebstore.google.com/detail/x",
    "https://chrome.google.com/webstore/detail/x",
    "",
    null,
    "not a url"
  ]) {
    assert.equal(isRestrictedUrl(url), true, url);
  }
  for (const url of ["https://example.com", "http://localhost:3000", "https://chrome.google.com/search"]) {
    assert.equal(isRestrictedUrl(url), false, url);
  }
});

test("relative time formatting", () => {
  const now = 1_000_000_000;
  assert.equal(formatRelativeTime(now - 2_000, now), "just now");
  assert.equal(formatRelativeTime(now - 30_000, now), "30s ago");
  assert.equal(formatRelativeTime(now - 5 * 60_000, now), "5m ago");
  assert.equal(formatRelativeTime(now - 3 * 3_600_000, now), "3h ago");
});

test("message contract is stable", () => {
  assert.deepEqual(Object.keys(MSG).sort(), ["COLLECT_FINGERPRINT", "GET_TAB_DATA", "PAGE_READY", "SCAN_TAB"]);
  assert.deepEqual(ok(1), { ok: true, data: 1 });
  assert.deepEqual(fail(ERROR.NO_TAB, "x"), { ok: false, error: { code: "NO_TAB", message: "x" } });
});

test("version helpers only report digits and prefer the most specific", () => {
  assert.equal(extractVersion("\\1", ["x", "6.8.1"]), "6.8.1");
  assert.equal(extractVersion("\\1", ["x", undefined]), null);
  assert.equal(extractVersion("\\1", ["x", "beta"]), null);
  assert.equal(pickVersion([null, "18", "18.3.1", "18.3"]), "18.3.1");
  assert.equal(pickVersion([null]), null);
});

test("probe is de-duplicated across rules", () => {
  const rules = [
    compileRule({ name: "A", category: "cms", js: { "x.y": true }, dom: { "#app": { attribute: "data-v" } } }),
    compileRule({ name: "B", category: "cms", js: { "x.y": true }, dom: { "#app": { attribute: "data-w" } } })
  ];
  const probe = buildProbe(rules);
  assert.deepEqual(probe.js, ["x.y"]);
  assert.deepEqual(probe.dom, [{ selector: "#app", attributes: ["data-v", "data-w"] }]);
});

test("main-world probe is self-contained (Chrome serializes it)", () => {
  // Re-create it from source with no surrounding scope, as executeScript does.
  const isolated = new Function(`return (${probeMainWorld.toString()})`)();
  const fakeWindow = {
    React: { version: "18.3.1" },
    Shopify: { shop: "demo.myshopify.com" },
    fn: () => {},
    litElementVersions: ["4.1.0"],
    getterThrows: Object.defineProperty({}, "x", { get() { throw new Error("nope"); } })
  };
  globalThis.window = fakeWindow;
  globalThis.document = { body: null };
  try {
    const { js, expando } = isolated(["React.version", "Shopify.shop", "fn", "missing.path", "litElementVersions.0", "getterThrows.x"], []);
    assert.deepEqual(js, { "React.version": "18.3.1", "Shopify.shop": "demo.myshopify.com", fn: true, "litElementVersions.0": "4.1.0" });
    assert.deepEqual(expando, {});
  } finally {
    delete globalThis.window;
    delete globalThis.document;
  }
});

test("every category has its own icon (no silent fallback)", async () => {
  const { CATEGORIES } = await import("../src/detector/categories.js");
  const { CATEGORY_ICON_IDS } = await import("../src/components/categoryIcons.js");
  const missing = Object.keys(CATEGORIES).filter((id) => !CATEGORY_ICON_IDS.includes(id));
  assert.deepEqual(missing, [], "categories without an icon");
});
