import { test } from "node:test";
import assert from "node:assert/strict";
import rules from "../src/detector/rules/index.js";
import { createDetector } from "../src/detector/engine/detector.js";
import { CATEGORIES } from "../src/detector/categories.js";
import { calculateConfidence, confidenceLevel } from "../src/detector/engine/confidence.js";

const detector = createDetector(rules);

const fp = (overrides = {}) => ({
  url: "https://example.com/",
  html: "<html><head></head><body></body></html>",
  scriptSrc: [],
  links: [],
  meta: {},
  cookies: {},
  dom: {},
  cssVars: {},
  js: {},
  expando: {},
  headers: {},
  ...overrides
});

const find = (results, name) => results.find((t) => t.name === name);
const names = (results) => results.map((t) => t.name);

test("every rule has a unique name, a known category and at least one signal or implier", () => {
  const seen = new Set();
  const implied = new Set(rules.flatMap((r) => r.implies ?? []));
  for (const rule of detector.rules) {
    assert.ok(!seen.has(rule.name), `duplicate rule ${rule.name}`);
    seen.add(rule.name);
    assert.ok(rule.category in CATEGORIES, `${rule.name} has unknown category ${rule.category}`);
    assert.ok(rule.signals.length || implied.has(rule.name), `${rule.name} can never be detected`);
    for (const target of rule.implies ?? []) assert.ok(seen.has(target) || rules.some((r) => r.name === target), `${rule.name} implies unknown ${target}`);
  }
});

test("plain page detects nothing", () => {
  assert.deepEqual(detector.detect(fp()), []);
});

test("WordPress: meta generator gives confirmed + version, implies PHP", () => {
  const results = detector.detect(
    fp({
      meta: { generator: ["WordPress 6.8.1"] },
      html: '<link rel="https://api.w.org/" href="/wp-json/"><img src="/wp-content/uploads/a.png">'
    })
  );
  const wp = find(results, "WordPress");
  assert.equal(wp.confidence, 100);
  assert.equal(wp.level, "confirmed");
  assert.equal(wp.version, "6.8.1");
  assert.ok(wp.evidence.some((e) => e.type === "meta"));
  assert.equal(find(results, "PHP").impliedBy, "WordPress");
});

test("WooCommerce implies WordPress which implies PHP (transitive)", () => {
  const results = detector.detect(fp({ js: { woocommerce_params: true } }));
  assert.ok(find(results, "WooCommerce"));
  assert.equal(find(results, "WordPress").impliedBy, "WooCommerce");
  assert.equal(find(results, "PHP").impliedBy, "WordPress");
});

test("Shopify from headers + globals + cookies", () => {
  const results = detector.detect(
    fp({
      headers: { "x-shopid": "123", "powered-by": "Shopify" },
      js: { "Shopify.shop": "demo.myshopify.com" },
      cookies: { _shopify_y: "abc" }
    })
  );
  const shopify = find(results, "Shopify");
  assert.equal(shopify.level, "confirmed");
  const cookieEvidence = shopify.evidence.find((e) => e.type === "cookies");
  assert.equal(cookieEvidence.value, "cookie set", "cookie values must never be exposed");
});

test("Next.js extracts version and implies React", () => {
  const results = detector.detect(
    fp({ js: { "next.version": "15.2.1", __NEXT_DATA__: true }, html: '<script src="/_next/static/chunks/main.js">' })
  );
  assert.equal(find(results, "Next.js").version, "15.2.1");
  assert.equal(find(results, "React").impliedBy, "Next.js");
});

test("React from DOM expando without any global", () => {
  const react = find(detector.detect(fp({ expando: { "__reactFiber$": true } })), "React");
  assert.equal(react.level, "confirmed");
});

test("false positive: react-icons / preact script URLs are NOT React", () => {
  const results = detector.detect(
    fp({ scriptSrc: ["https://cdn.example.com/react-icons.js", "https://cdn.example.com/preact.min.js"] })
  );
  assert.equal(find(results, "React"), undefined);
});

test("real React bundle URL is a possible/likely signal, not confirmed", () => {
  const react = find(detector.detect(fp({ scriptSrc: ["https://unpkg.com/react@18.3.1/umd/react.production.min.js"] })), "React");
  assert.ok(react);
  assert.equal(react.version, "18.3.1");
  assert.notEqual(react.level, "confirmed");
});

test("false positive: bootstrap-icons is NOT Bootstrap", () => {
  const results = detector.detect(fp({ links: ["https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css"] }));
  assert.equal(find(results, "Bootstrap"), undefined);
  assert.ok(find(results, "jsDelivr"));
});

test("Bootstrap version from jsDelivr URL", () => {
  const bs = find(
    detector.detect(fp({ links: ["https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"] })),
    "Bootstrap"
  );
  assert.equal(bs.version, "5.3.3");
});

test("jquery-ui is not matched as jQuery itself (only implied by jQuery UI); jquery-3.7.1.min.js is", () => {
  const viaUi = find(detector.detect(fp({ scriptSrc: ["https://x.com/jquery-ui.min.js"] })), "jQuery");
  assert.equal(viaUi?.impliedBy, "jQuery UI");
  assert.ok(viaUi.evidence.every((e) => e.type === "implied"));
  assert.equal(find(detector.detect(fp({ scriptSrc: ["https://x.com/js/jquery-3.7.1.min.js"] })), "jQuery").version, "3.7.1");
});

test("Angular version from ng-version attribute", () => {
  const ng = find(
    detector.detect(fp({ dom: { "[ng-version]": { exists: true, attributes: { "ng-version": "19.1.0" } } } })),
    "Angular"
  );
  assert.equal(ng.version, "19.1.0");
});

test("infrastructure from headers: Cloudflare + Nginx version", () => {
  const results = detector.detect(fp({ headers: { server: "cloudflare", "cf-ray": "8abc-BOM" } }));
  assert.equal(find(results, "Cloudflare").level, "confirmed");
  assert.equal(find(detector.detect(fp({ headers: { server: "nginx/1.25.3" } })), "Nginx").version, "1.25.3");
});

test("Apache-Coyote (Tomcat) is not Apache HTTP Server", () => {
  assert.equal(find(detector.detect(fp({ headers: { server: "Apache-Coyote/1.1" } })), "Apache HTTP Server"), undefined);
});

test("cookie prefix match (ph_*) works", () => {
  assert.ok(find(detector.detect(fp({ cookies: { ph_phc_abc_posthog: "x" } })), "PostHog"));
});

test("results are grouped by category order, then confidence", () => {
  const results = detector.detect(
    fp({ headers: { server: "cloudflare" }, meta: { generator: ["WordPress 6.8"] }, js: { "jQuery.fn.jquery": "3.7.1" } })
  );
  assert.deepEqual(names(results).slice(0, 2), ["WordPress", "jQuery"]);
});

test("confidence math and levels", () => {
  assert.equal(calculateConfidence([{ weight: 30 }, { weight: 40 }]), 70);
  assert.equal(calculateConfidence([{ weight: 90 }, { weight: 90 }]), 100);
  assert.equal(confidenceLevel(100), "confirmed");
  assert.equal(confidenceLevel(60), "likely");
  assert.equal(confidenceLevel(40), "possible");
});

test("probe only requests what rules need", () => {
  const { probe } = detector;
  assert.ok(probe.js.includes("React.version"));
  assert.ok(probe.expando.includes("__reactFiber$"));
  assert.ok(probe.dom.some((d) => d.selector === "[ng-version]" && d.attributes.includes("ng-version")));
  assert.ok(probe.cssVars.includes("--tw-shadow"));
});
