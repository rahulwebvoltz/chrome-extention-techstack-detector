// Downloads the community-maintained Wappalyzer fingerprint database
// (https://github.com/enthec/webappanalyzer, GPL-3.0) into vendor/.
// Then run `npm run pack:import` to convert it into our rule format.
//
//   npm run pack:fetch
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const REPO = "enthec/webappanalyzer";
const OUT = resolve(import.meta.dirname, "../vendor/webappanalyzer");
const FILES = ["_", ..."abcdefghijklmnopqrstuvwxyz"].map((c) => `src/technologies/${c}.json`);

async function get(path, ref) {
  const res = await fetch(`https://raw.githubusercontent.com/${REPO}/${ref}/${path}`);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.text();
}

let commit;
try {
  commit = (await (await fetch(`https://api.github.com/repos/${REPO}/commits/main`)).json()).sha;
} catch (err) {
  // Nothing has been written yet, so any existing vendor/ data is untouched.
  console.error(
    `pack:fetch: could not reach GitHub (${err.cause?.code ?? err.message}).\n` +
      "Check your internet connection, VPN, proxy or DNS and try again.\n" +
      "Existing data in vendor/webappanalyzer (if any) was left unchanged — `npm run build` can still use it."
  );
  process.exit(1);
}
if (!commit) throw new Error("Could not resolve the latest commit of " + REPO + " (GitHub API rate limit?)");

mkdirSync(resolve(OUT, "technologies"), { recursive: true });
writeFileSync(resolve(OUT, "LICENSE"), await get("LICENSE", commit));
writeFileSync(resolve(OUT, "categories.json"), await get("src/categories.json", commit));
for (const file of FILES) {
  writeFileSync(resolve(OUT, "technologies", file.split("/").pop()), await get(file, commit));
}
// Icons: one per technology in src/images/icons. Fetched as the repo tarball
// (thousands of files) and extracted with the system `tar` (Windows 10+,
// macOS and Linux all ship one).
const tarball = resolve(OUT, "repo.tgz");
const res = await fetch(`https://codeload.github.com/${REPO}/tar.gz/${commit}`);
if (!res.ok) throw new Error(`icons tarball: HTTP ${res.status}`);
writeFileSync(tarball, Buffer.from(await res.arrayBuffer()));
rmSync(resolve(OUT, "icons"), { recursive: true, force: true });
mkdirSync(resolve(OUT, "icons"), { recursive: true });
// Relative paths + cwd: GNU tar (e.g. Git Bash) treats "C:" in a path as a remote host
execFileSync("tar", ["-xzf", "repo.tgz", "-C", "icons", "--strip-components=4", `webappanalyzer-${commit}/src/images/icons`], { cwd: OUT });
rmSync(tarball);

writeFileSync(
  resolve(OUT, "SOURCE.md"),
  `# webappanalyzer fingerprint data\n\nSource: https://github.com/${REPO}\nCommit: ${commit}\nFetched: ${new Date().toISOString()}\nLicense: GPL-3.0 (see LICENSE)\n\nThis data is used only by the optional GPL rules pack (src/detector/packs/).\nBuild without it with \`npm run build -- --no-gpl-pack\`.\n`
);
console.log(`Fetched ${REPO}@${commit.slice(0, 7)} → vendor/webappanalyzer`);

// Shrink the few oversized icons (needs Edge/Chromium; skipped otherwise)
execFileSync(process.execPath, [resolve(import.meta.dirname, "optimize-icons.mjs")], { stdio: "inherit" });
