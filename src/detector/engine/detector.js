import { categoryOf } from "../categories.js";
import { calculateConfidence, confidenceLevel } from "./confidence.js";
import { compileRule, matchSignal } from "./matcher.js";
import { pickVersion } from "./patterns.js";
import { buildProbe } from "./probe.js";

// Generic engine: no technology-specific code lives here. Everything a
// technology needs is declared in its rule; this just runs rules against a
// fingerprint and scores the evidence.
export function createDetector(rules) {
  const compiled = [];
  for (const rule of rules) {
    try {
      compiled.push(compileRule(rule));
    } catch (err) {
      // One bad pattern (e.g. in an imported pack) must not take down detection
      console.warn(`[TechStack] skipped rule ${rule.name}: ${err.message}`);
    }
  }
  const byName = new Map(compiled.map((r) => [r.name, r]));

  return {
    rules: compiled,
    probe: buildProbe(compiled),
    detect: (fingerprint) => detect(fingerprint, compiled, byName)
  };
}

function toResult(rule, { confidence, version = null, evidence, impliedBy = null }) {
  return {
    name: rule.name,
    category: rule.category,
    // Rule packs bring categories we don't define; they carry their own label/order
    categoryLabel: rule.categoryLabel ?? categoryOf(rule.category).label,
    categoryOrder: rule.categoryOrder ?? categoryOf(rule.category).order,
    website: rule.website ?? null,
    color: rule.color ?? null,
    iconFile: rule.iconFile ?? null,
    confidence,
    level: confidenceLevel(confidence),
    version,
    impliedBy,
    evidence
  };
}

function detect(fingerprint, rules, byName) {
  const found = new Map();

  for (const rule of rules) {
    const evidence = [];
    const versions = [];
    let detected = false;

    for (const signal of rule.signals) {
      const hit = matchSignal(signal, fingerprint);
      if (!hit) continue;
      evidence.push(hit.evidence);
      versions.push(hit.version);
      if (!signal.versionOnly) detected = true;
    }
    // versionOnly signals refine a detection but never cause one
    if (!detected || calculateConfidence(evidence) === 0) continue;

    evidence.sort((a, b) => b.weight - a.weight);
    found.set(rule.name, toResult(rule, {
      confidence: calculateConfidence(evidence),
      version: pickVersion(versions),
      evidence
    }));
  }

  resolveImplies(found, byName);
  applyExcludes(found, byName);
  applyRequires(found, byName);

  return [...found.values()].sort(
    (a, b) =>
      a.categoryOrder - b.categoryOrder ||
      b.confidence - a.confidence ||
      a.name.localeCompare(b.name)
  );
}

// "Lodash excludes Underscore.js": both expose _.VERSION, so when the more
// specific technology is present, drop the one it would be confused with.
function applyExcludes(found, byName) {
  for (const name of [...found.keys()]) {
    if (!found.has(name)) continue; // already excluded by another technology
    for (const excluded of byName.get(name)?.excludes ?? []) found.delete(excluded);
  }
}

// "a3 Lazy Load requires WordPress": some fingerprints are only meaningful
// alongside another technology (or any technology of a category). Repeat
// until stable, since removing one can invalidate another.
function applyRequires(found, byName) {
  let changed = true;
  while (changed) {
    changed = false;
    const categories = new Set([...found.values()].map((t) => t.category));
    for (const [name] of found) {
      const rule = byName.get(name);
      const missingTech = (rule?.requires ?? []).some((req) => !found.has(req));
      const missingCategory = rule?.requiresCategory?.length && !rule.requiresCategory.some((c) => categories.has(c));
      if (missingTech || missingCategory) {
        found.delete(name);
        changed = true;
      }
    }
  }
}

// "Next.js implies React", "WooCommerce implies WordPress", … Implied
// technologies inherit the confidence of whatever implied them.
function resolveImplies(found, byName) {
  const queue = [...found.values()];
  while (queue.length) {
    const parent = queue.shift();
    for (const name of byName.get(parent.name)?.implies ?? []) {
      const rule = byName.get(name);
      if (!rule) continue;

      const existing = found.get(name);
      if (existing && existing.confidence >= parent.confidence) continue;

      const evidence = [
        { type: "implied", key: null, value: `Implied by ${parent.name}`, weight: parent.confidence },
        ...(existing?.evidence ?? [])
      ];
      const result = toResult(rule, {
        confidence: Math.max(parent.confidence, existing?.confidence ?? 0),
        version: existing?.version ?? null,
        evidence,
        impliedBy: existing ? null : parent.name
      });
      found.set(name, result);
      queue.push(result);
    }
  }
}
