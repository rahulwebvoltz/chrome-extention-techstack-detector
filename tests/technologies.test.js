// Coverage tests: every rule must fire on a realistic fingerprint, extract
// its version when one is expected, and not fire on known look-alikes.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import rules from "../src/detector/rules/index.js";
import { createDetector } from "../src/detector/engine/detector.js";
import { POSITIVE, IMPLIED_ONLY, NEGATIVE } from "./fixtures/technologies.js";

const detector = createDetector(rules);
const LEVEL_RANK = { possible: 0, likely: 1, confirmed: 2 };

const fingerprint = (overrides) => ({
  url: "https://example.com/",
  html: "",
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

test("100+ unique technology rules", () => {
  assert.ok(rules.length >= 100, `only ${rules.length} rules`);
  const lower = rules.map((r) => r.name.toLowerCase());
  const dupes = lower.filter((n, i) => lower.indexOf(n) !== i);
  assert.deepEqual(dupes, [], "duplicate technology names (case-insensitive)");
});

test("every rule has a positive fixture (or is implied-only)", () => {
  const missing = rules.map((r) => r.name).filter((n) => !(n in POSITIVE) && !(n in IMPLIED_ONLY));
  assert.deepEqual(missing, [], "rules without a test fixture");
  const stale = Object.keys(POSITIVE).filter((n) => !rules.some((r) => r.name === n));
  assert.deepEqual(stale, [], "fixtures for rules that no longer exist");
});

describe("each technology is detected from its fixture", () => {
  for (const [name, { fp, version }] of Object.entries(POSITIVE)) {
    test(name, () => {
      const tech = detector.detect(fingerprint(fp)).find((t) => t.name === name);
      assert.ok(tech, `${name} not detected`);
      assert.ok(LEVEL_RANK[tech.level] >= LEVEL_RANK.likely, `${name} only "${tech.level}" (${tech.confidence})`);
      assert.ok(tech.evidence.length > 0, "detection without evidence");
      if (version) assert.equal(tech.version, version, `${name} version`);
      else assert.equal(tech.version, null, `${name} reported a version without a reliable fingerprint`);
    });
  }
});

describe("implied-only technologies come from their parent", () => {
  for (const [name, parent] of Object.entries(IMPLIED_ONLY)) {
    test(`${name} via ${parent}`, () => {
      const tech = detector.detect(fingerprint(POSITIVE[parent].fp)).find((t) => t.name === name);
      assert.ok(tech, `${name} not implied`);
      assert.equal(tech.impliedBy, parent);
    });
  }
});

describe("false positives", () => {
  for (const { name, why, fp, maxLevel } of NEGATIVE) {
    test(`${name}: ${why}`, () => {
      const tech = detector.detect(fingerprint(fp)).find((t) => t.name === name);
      // Being implied by another real detection (e.g. jQuery UI → jQuery) is fine;
      // what must not happen is matching the look-alike signal directly.
      const direct = tech?.evidence.filter((e) => e.type !== "implied") ?? [];
      if (!maxLevel) assert.equal(direct.length, 0, `${name} wrongly matched: ${JSON.stringify(direct)}`);
      else if (tech) assert.ok(LEVEL_RANK[tech.level] <= LEVEL_RANK[maxLevel], `${name} reached "${tech.level}"`);
    });
  }
});

test("unknown site: nothing detected, no crash on empty/partial fingerprints", () => {
  assert.deepEqual(detector.detect(fingerprint({ html: "<html><body><h1>Hello</h1></body></html>" })), []);
  assert.deepEqual(detector.detect({}), []);
  assert.deepEqual(detector.detect({ url: "https://x.com", html: null, headers: undefined }), []);
});

test("every technology referenced by `implies` exists", () => {
  const names = new Set(rules.map((r) => r.name));
  for (const r of rules) for (const target of r.implies ?? []) assert.ok(names.has(target), `${r.name} → ${target}`);
});

test("rule regexes are not global/sticky (stateful lastIndex would skip matches)", () => {
  for (const rule of detector.rules) {
    for (const s of rule.signals) {
      assert.ok(!s.regex || (!s.regex.global && !s.regex.sticky), `${rule.name} ${s.type} uses /g or /y`);
    }
  }
});

describe("cookie name matching", () => {
  const detect = (cookies) => detector.detect(fingerprint({ cookies }));
  const find = (results, name) => results.find((t) => t.name === name);

  test("Laravel: <app>_session + XSRF-TOKEN is likely, and evidence names the real cookie", () => {
    const laravel = find(detect({ "my-shop_session": "", "XSRF-TOKEN": "" }), "Laravel");
    assert.equal(laravel.level, "likely");
    assert.ok(laravel.evidence.some((e) => e.key === "my-shop_session"), "evidence should show the matched cookie name");
  });

  test("Rails-style _app_session is not Laravel but hints Rails", () => {
    const results = detect({ _myapp_session: "" });
    assert.equal(find(results, "Laravel"), undefined);
    assert.equal(find(results, "Ruby on Rails")?.level, "possible");
  });

  test("glob prefix (_pk_id*) and prefix with dots (.AspNetCore.Antiforgery*)", () => {
    assert.ok(find(detect({ "_pk_id.1.abcd": "" }), "Matomo"));
    assert.ok(find(detect({ ".AspNetCore.Antiforgery.xyz": "" }), "ASP.NET"));
  });

  test("cookie values never appear in evidence", () => {
    const shopify = find(detect({ _shopify_y: "SECRET-VALUE" }), "Shopify");
    assert.ok(!JSON.stringify(shopify).includes("SECRET-VALUE"));
  });
});

describe("signals found by webvoltz.com / calgameswanted.com vs Wappalyzer", () => {
  const detect = (fp) => detector.detect(fingerprint(fp));
  const find = (results, name) => results.find((t) => t.name === name);

  test("WP Rocket version from its generator tag", () => {
    const meta = { generator: ["WordPress 7.1.3", "WP Rocket 3.23.5.1"] };
    assert.equal(find(detect({ meta }), "WP Rocket").version, "3.23.5.1");
  });

  test("core-js and Lottie versions from their globals", () => {
    const js = { "__core-js_shared__.versions": true, "__core-js_shared__.versions.0.version": "3.46.0", "lottie.version": "5.6.8", lottie: true };
    const results = detect({ js });
    assert.equal(find(results, "core-js").version, "3.46.0");
    assert.equal(find(results, "Lottie").version, "5.6.8");
  });

  test("core-js version alone (versionOnly) doesn't detect core-js", () => {
    assert.equal(find(detect({ js: { "__core-js_shared__.versions.0.version": "3.46.0" } }), "core-js"), undefined);
  });

  test("Font Awesome from merged CSS text (no stylesheet URL)", () => {
    const css = '.fab{font-family:"Font Awesome 5 Brands"}.fa,.fas{font-family:"Font Awesome 5 Free";font-weight:900}';
    assert.equal(find(detect({ css }), "Font Awesome")?.level, "confirmed");
  });

  test("Google Fonts from @font-face src in CSS", () => {
    const css = '@font-face{font-family:Inter;src:url(https://fonts.gstatic.com/s/inter/v13/abc.woff2) format("woff2")}';
    assert.ok(find(detect({ css }), "Google Fonts"));
  });

  test("unpkg: dns-prefetch hint alone is 'likely', a loaded file is 'confirmed'", () => {
    assert.equal(find(detect({ html: '<link rel="dns-prefetch" href="//unpkg.com">' }), "unpkg")?.level, "likely");
    assert.equal(find(detect({ html: '<link href="//unpkg.com" rel="preconnect">' }), "unpkg")?.level, "likely");
    assert.equal(find(detect({ links: ["https://unpkg.com/"] }), "unpkg"), undefined, "bare host without a file");
    assert.equal(find(detect({ scriptSrc: ["https://unpkg.com/htmx.org@2.0.0"] }), "unpkg")?.level, "confirmed");
  });

  test("decoded data: scripts (WP Rocket delayed JS) are matched like inline scripts", () => {
    const inlineScripts = 'fetch("http://ip-api.com/json/?fields=countryCode").then(r => r.json())';
    assert.ok(find(detect({ inlineScripts }), "ip-api"));
  });

  test("Cloudflare Browser Insights from its RUM beacon XHR", () => {
    assert.ok(find(detect({ requests: ["https://example.com/cdn-cgi/rum?"] }), "Cloudflare Browser Insights"));
  });
});

describe("signals found by thecuelist.com vs Wappalyzer", () => {
  const detect = (fp) => detector.detect(fingerprint(fp));
  const find = (results, name) => results.find((t) => t.name === name);

  test("static Astro site (no islands, no generator) is confirmed via scoped-style attributes", () => {
    const html = '<link rel="stylesheet" href="/_astro/index.516CJN5B.css"><div class="wall-item" data-astro-cid-6y2sa4q5>';
    assert.equal(find(detect({ html }), "Astro")?.level, "confirmed");
  });

  test("Fastly confirmed from x-served-by + x-timer; Firebase Hosting from its vary header", () => {
    const headers = { "x-served-by": "cache-bom-vanm7210021-BOM", "x-timer": "S1791957353.358680,VS0,VE1", vary: "x-fh-requested-host, accept-encoding" };
    const results = detect({ headers });
    assert.equal(find(results, "Fastly")?.level, "confirmed");
    assert.equal(find(results, "Firebase")?.level, "confirmed");
  });

  test("PWA: manifest + theme-color is confirmed", () => {
    const fp = { dom: { 'link[rel="manifest"]': { exists: true, attributes: {} } }, meta: { "theme-color": ["#0d2744"] } };
    assert.equal(find(detect(fp), "PWA")?.level, "confirmed");
  });
});
