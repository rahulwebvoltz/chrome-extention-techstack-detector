// All technology rules. To add a technology, add an entry to the matching
// category file — no engine changes needed.
//
// Rule shape (every signal type is optional):
//   name, category, website, color, implies: ["Other Tech"]
//   html:      [PatternSpec]                 — page HTML + decoded data: scripts
//   css:       [PatternSpec]                 — text of same-origin stylesheets
//   xhr:       [PatternSpec]                 — XHR/fetch/beacon request URLs
//   scriptSrc: [PatternSpec]                 — <script src> URLs
//   links:     [PatternSpec]                 — <link href> URLs (CSS, fonts…)
//   url:       [PatternSpec]                 — page URL
//   meta:      { name: PatternSpec }         — <meta name|property>
//   headers:   { name: PatternSpec }         — HTTP response headers
//   cookies:   { name: PatternSpec }         — exact, "glob_*" or "/regex/"; HttpOnly included
//   js:        { "dot.path": PatternSpec }   — page globals (main world)
//   dom:       { selector: PatternSpec + attribute? }
//   expando:   ["__prefix"]                  — JS props on DOM nodes
//   cssVars:   ["--var-name"]                — computed CSS custom props
//   jsPrefix:  ["webpackChunk"]              — globals with generated names
//   excludes:  ["Other Tech"]                — drop a look-alike when this is found
// See engine/patterns.js for PatternSpec.
import analytics from "./analytics.js";
import cdn from "./cdn.js";
import cms from "./cms.js";
import ecommerce from "./ecommerce.js";
import frameworks from "./frameworks.js";
import hosting from "./hosting.js";
import languages from "./languages.js";
import libraries from "./libraries.js";
import media from "./media.js";
import misc from "./misc.js";
import widgets from "./widgets.js";
import wordpress from "./wordpress.js";
import payments from "./payments.js";
import security from "./security.js";
import servers from "./servers.js";
import ui from "./ui.js";

export default [
  ...cms,
  ...wordpress,
  ...ecommerce,
  ...payments,
  ...frameworks,
  ...libraries,
  ...ui,
  ...analytics,
  ...media,
  ...widgets,
  ...misc,
  ...security,
  ...cdn,
  ...hosting,
  ...servers,
  ...languages
];
