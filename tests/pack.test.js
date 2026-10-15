// Tests for the optional GPL Wappalyzer pack: the converter, and (when it
// has been generated) the pack itself.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { parsePattern, convertAll, PACK_PATCHES } from "../scripts/lib/convertWappalyzer.mjs";
import { extractVersion } from "../src/detector/engine/patterns.js";
import { createDetector } from "../src/detector/engine/detector.js";
import coreRules from "../src/detector/rules/index.js";

const CATEGORIES = {
  1: { name: "CMS", priority: 1 },
  6: { name: "Ecommerce", priority: 1 },
  53: { name: "CRM", priority: 5 },
  87: { name: "WordPress plugins", priority: 8 }
};
const convert = (technologies) => convertAll(technologies, CATEGORIES, coreRules.map((r) => r.name));
const emptyFp = (o = {}) => ({ html: "", text: "", scriptContent: "", scriptSrc: [], links: [], meta: {}, cookies: {}, dom: {}, js: {}, headers: {}, ...o });

describe("pattern parsing", () => {
  test("modifiers: version and confidence", () => {
    assert.deepEqual(parsePattern("^([\\d.]+)\\;version:\\1\\;confidence:50"), { regex: "^([\\d.]+)", version: "\\1", weight: 50 });
    assert.deepEqual(parsePattern(""), { weight: 100 });
  });
  test("confidence:0 becomes version-only", () => {
    assert.equal(parsePattern("^(.+)$\\;confidence:0\\;version:\\1").versionOnly, true);
  });
  test("invalid regex is rejected", () => {
    assert.equal(parsePattern("(unclosed"), null);
  });
  test("ternary version templates", () => {
    assert.equal(extractVersion("\\1?GA4:UA", ["x", "G-"]), "GA4");
    assert.equal(extractVersion("\\1?2+:", ["x", undefined]), null);
  });
});

describe("technology conversion", () => {
  const { rules, stats } = convert({
    "Acme CRM": {
      cats: [53],
      scriptSrc: ["cdn\\.acme\\.io/crm\\.js\\;version:1"],
      text: ["Powered by Acme"],
      scripts: ["acmeInit\\("],
      cookies: { "_acme_\\d+": "", "(?i)ltpa": "" },
      dom: { "#acme": { attributes: { "data-v": "([\\d.]+)\\;version:\\1" }, text: "Acme" }, ".acme-widget": { exists: "" } },
      implies: "PHP\\;confidence:50",
      requiresCategory: [6]
    },
    WordPress: { cats: [1], meta: { generator: "WordPress" } },
    "Google Font API": { cats: [17], html: "fonts\\.googleapis" },
    "Only DNS": { cats: [19], dns: { TXT: "acme" } }
  });
  const acme = rules.find((r) => r.name === "Acme CRM");

  test("our own rules win; aliases are respected; server-only techs are skipped", () => {
    // Our technologies only appear as supplements (signals merged into our rule)
    assert.ok(rules.filter((r) => r.name === "WordPress").every((r) => r.supplement));
    assert.ok(!rules.some((r) => r.name === "Google Font API"), "Google Font API is our Google Fonts");
    assert.ok(rules.some((r) => r.name === "Google Fonts" && r.supplement), "aliased into a supplement for Google Fonts");
    assert.ok(rules.filter((r) => r.supplement).every((r) => !r.implies && !r.category), "supplements carry signals only");
    assert.ok(!rules.some((r) => r.name === "Only DNS"));
    assert.equal(stats.skippedServerOnly, 1);
  });
  test("unmapped category keeps its own label", () => {
    assert.equal(acme.categoryLabel, "CRM");
    assert.match(acme.category, /^wa-53$/);
  });
  test("text and scripts map to their own signal types (not raw HTML)", () => {
    assert.equal(acme.text.length, 1);
    assert.equal(acme.scripts.length, 1);
    assert.equal(acme.html, undefined);
  });
  test("cookie name regexes, including PCRE (?i), become /regex/ keys", () => {
    assert.ok("/^_acme_\\d+$/" in acme.cookies);
    assert.ok("/^ltpa$/" in acme.cookies);
  });
  test("dom attributes and text", () => {
    assert.deepEqual(acme.dom["#acme"].map((s) => s.attribute), ["data-v", "#text"]);
    assert.equal(acme.dom[".acme-widget"].length, 1);
  });
  test("implies strips modifiers; requiresCategory maps to our ids", () => {
    assert.deepEqual(acme.implies, ["PHP"]);
    assert.deepEqual(acme.requiresCategory, ["ecommerce"]);
  });
  test("requiresCategory is enforced by the engine", () => {
    const detector = createDetector([...coreRules, acme]);
    const fp = emptyFp({ scriptSrc: ["https://cdn.acme.io/crm.js"] });
    assert.equal(detector.detect(fp).find((t) => t.name === "Acme CRM"), undefined, "no ecommerce detected → dropped");
    const withShop = detector.detect({ ...fp, headers: { "x-shopid": "1" } });
    assert.ok(withShop.find((t) => t.name === "Acme CRM"));
    assert.equal(withShop.find((t) => t.name === "Acme CRM").categoryLabel, "CRM");
  });
  test("text signals match visible text only, not markup", () => {
    const detector = createDetector([{ ...acme, requiresCategory: undefined }]);
    assert.equal(detector.detect(emptyFp({ html: '<a href="/powered-by-acme">' })).length, 0);
    assert.equal(detector.detect(emptyFp({ text: "Powered by Acme" })).length, 1);
  });
});

test("dom properties become expando checks, not bare element-exists (Preact on every page)", () => {
  const { rules } = convert({ Preact: { cats: [59], dom: { "#app, body": { properties: { __k: "" } } } } });
  const preact = rules.find((r) => r.name === "Preact");
  assert.equal(preact.dom, undefined);
  assert.ok(preact.expando.includes("__k"));
});

test("exact names win over normalised matches (ip-api vs ipapi)", () => {
  const { rules } = convert({ "ip-api": { cats: [79], xhr: "ip-api\.com", icon: "ip-api.png" } });
  const sup = rules.find((r) => r.supplement && r.iconFile === "ip-api.png");
  assert.equal(sup?.name, "ip-api");
});

test("patches exist for the known-bad upstream fingerprints", () => {
  for (const name of ["PyScript", "Amazon Webstore", "Onsen UI", "p5.js", "Sirvoy", "Docusaurus"]) assert.ok(PACK_PATCHES[name], name);
});

const PACK = new URL("../src/detector/packs/wappalyzer.generated.js", import.meta.url);
describe("generated GPL pack", { skip: !existsSync(PACK) && "not generated (run npm run pack:import)" }, () => {
  test("loads, compiles, and doesn't collide with our rules", async () => {
    const { default: packFile } = await import(PACK);
    const pack = packFile.filter((r) => !r.supplement);
    assert.ok(pack.length > 7000, `only ${pack.length} technologies`);
    const detector = createDetector([...coreRules, ...pack]);
    assert.ok(detector.rules.length >= coreRules.length + pack.length - 5, "too many rules failed to compile");
    const names = detector.rules.map((r) => r.name.toLowerCase());
    assert.deepEqual(names.filter((n, i) => names.indexOf(n) !== i), [], "duplicate names");
    const all = new Set(detector.rules.map((r) => r.name));
    const dangling = detector.rules.flatMap((r) => [...(r.implies ?? []), ...(r.requires ?? [])]).filter((n) => !all.has(n));
    assert.deepEqual([...new Set(dangling)], [], "implies/requires pointing at unknown technologies");
  });

  test("a plain page detects nothing even with 7,000+ rules", async () => {
    const { detector } = await import("../src/detector/index.js");
    const results = detector.detect(emptyFp({ url: "https://example.com/", html: "<html><body><h1>Hello</h1><p>Welcome</p></body></html>", text: "Hello Welcome" }));
    assert.deepEqual(results.map((t) => t.name), []);
  });
});

describe("pack supplements for our own rules", { skip: !existsSync(PACK) && "not generated" }, () => {
  test("Wappalyzer signals our rule lacks are merged in (pack builds only)", async () => {
    const { detector } = await import("../src/detector/index.js");
    const segment = detector.rules.find((r) => r.name === "Segment");
    assert.ok(segment.signals.some((s) => s.type === "js" && s.key === "analytics.VERSION"), "Segment gained analytics.VERSION");
    // our curated metadata is kept
    assert.equal(segment.category, "analytics");
    assert.equal(detector.rules.filter((r) => r.name === "Segment").length, 1, "merged, not duplicated");
  });

  test("CSP-listed services are detected when headers are available", async () => {
    const { detector } = await import("../src/detector/index.js");
    const csp = "default-src 'self'; script-src 'self' https://cdn.plaid.com/ https://js.verygoodvault.com/ https://snap.licdn.com; frame-src https://*.sheerid.com";
    const names = detector.detect(emptyFp({ headers: { "content-security-policy": csp, "x-powered-by": "Express" } })).map((t) => t.name);
    for (const n of ["Plaid", "Very Good Security", "SheerID", "LinkedIn Insight Tag", "Express", "Node.js"]) assert.ok(names.includes(n), n + " not detected");
  });
});
