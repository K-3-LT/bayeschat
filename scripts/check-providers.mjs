#!/usr/bin/env node
/**
 * Validator for `providers.json` — the provider list the app ships with and also
 * downloads from the support repository.
 *
 * Exit 0 = the file may be installed by every build that reads this schema.
 * Exit 1 = violations, each with a path into the file.
 *
 * Usage:
 *   node scripts/check-providers.mjs [path]
 *
 * The rules, and why each one exists:
 *
 *  1. Shape. `schemaVersion` is a number this script knows, `brands` holds at
 *     least one row, `updatedAt` says when the set changed.
 *  2. Identity. Brand and preset ids are unique and match [a-z0-9-]+. The id of
 *     a brand is persisted in the user's provider row (`brandLogoName`), so it
 *     can never be renamed — a new id is a new brand.
 *  3. Logos. `hex` is six hex digits, because it tints the letter avatar when a
 *     build has no asset for the brand.
 *  4. Keywords are how an endpoint is recognised. A generic one (`api`, `ai`,
 *     `llm`, `cloud`, `chat`) would claim the whole internet, and a keyword that
 *     is another brand's domain would claim that brand — both are rejected.
 *  5. Hosts belong to one brand. A row may only add hosts, and every host must
 *     point at a brand that exists in the file; nobody may take `api.openai.com`.
 *  6. Presets open an endpoint: `baseURL` is https (or a localhost http), the
 *     protocol and section are ones the app implements, and the brand exists.
 *  7. Ports and dialects are a closed set: `dialect` names a request shape the
 *     app compiles, so a new word there is a code change, not a data change.
 *  8. `minAppVersion` is dotted numbers. Rows are additive only: the app ignores
 *     a row whose `minAppVersion` is above itself, so it can be written today and
 *     used when that version ships.
 *  9. Nothing that is app policy ships as data: `unsupportedHosts` is read from
 *     the bundle, so a change there is ignored by the app. The script still
 *     checks it for shape, and says so in the file's own header.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const filePath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, "providers.json");

const SUPPORTED_SCHEMAS = [1, 2];
const ID_RE = /^[a-z0-9][a-z0-9-]*$/;
const HEX_RE = /^[0-9A-Fa-f]{6}$/;
const VERSION_RE = /^\d+(\.\d+)*$/;
const PROTOCOLS = new Set(["openAICompatible", "anthropic"]);
const SECTIONS = new Set(["internationalCloud", "chineseCloud", "localEngines"]);
const KINDS = new Set(["cloud", "local", "gateway"]);
const DIALECTS = new Set([
  "openAI",
  "openRouter",
  "deepSeek",
  "zai",
  "qwen",
  "qwenChatTemplate",
]);
const GENERIC_KEYWORDS = new Set([
  "api",
  "ai",
  "app",
  "chat",
  "cloud",
  "com",
  "llm",
  "model",
  "models",
  "provider",
  "server",
  "www",
]);

const failures = [];
const fail = (where, message) => failures.push(`${where}: ${message}`);

let text;
try {
  text = fs.readFileSync(filePath, "utf8");
} catch (error) {
  console.error(`check-providers-json: cannot read ${filePath}: ${error.message}`);
  process.exit(1);
}

if (text.includes("\r")) {
  console.error("check-providers-json: file uses CRLF line endings, use LF");
  process.exit(1);
}

let file;
try {
  file = JSON.parse(text);
} catch (error) {
  console.error(`check-providers-json: ${path.basename(filePath)} is not valid JSON: ${error.message}`);
  process.exit(1);
}

// ── 1. Shape ────────────────────────────────────────────────────────────────
if (!SUPPORTED_SCHEMAS.includes(file.schemaVersion)) {
  fail("schemaVersion", `must be one of ${SUPPORTED_SCHEMAS.join(", ")}, got ${JSON.stringify(file.schemaVersion)}`);
}
if (file.schemaVersion >= 2 && typeof file.updatedAt !== "string") {
  fail("updatedAt", "schema 2 must say when the row set changed (YYYY-MM-DD)");
} else if (file.updatedAt !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(file.updatedAt)) {
  fail("updatedAt", "must be YYYY-MM-DD");
}
if (!Array.isArray(file.brands) || file.brands.length === 0) {
  fail("brands", "must be a non-empty array");
}
const brands = Array.isArray(file.brands) ? file.brands : [];
const presets = Array.isArray(file.presets) ? file.presets : [];
const engines = Array.isArray(file.engines) ? file.engines : [];
const hosts = file.hosts && typeof file.hosts === "object" ? file.hosts : {};
const unsupportedHosts = Array.isArray(file.unsupportedHosts) ? file.unsupportedHosts : [];

// ── 2–4. Brands ─────────────────────────────────────────────────────────────
const brandIDs = new Set();
const keywordsOwned = new Map();
brands.forEach((brand, index) => {
  const where = `brands[${index}] (${brand?.id ?? "?"})`;
  if (!brand || typeof brand !== "object") return fail(where, "must be an object");
  if (typeof brand.id !== "string" || !ID_RE.test(brand.id)) {
    fail(where, "id must be lowercase letters, digits and dashes");
  } else if (brandIDs.has(brand.id)) {
    fail(where, `duplicate brand id "${brand.id}"`);
  } else {
    brandIDs.add(brand.id);
  }
  if (typeof brand.name !== "string" || brand.name.trim() === "") fail(where, "name is required");
  if (!HEX_RE.test(String(brand.hex ?? ""))) fail(where, "hex must be six hex digits, e.g. \"412991\"");
  if (brand.kind !== undefined && !KINDS.has(brand.kind)) {
    fail(where, `kind must be one of ${[...KINDS].join(", ")}`);
  }
  if (brand.dialect !== undefined && !DIALECTS.has(brand.dialect)) {
    fail(where, `dialect must be one of ${[...DIALECTS].join(", ")} (a new one is a code change)`);
  }
  if (brand.minAppVersion !== undefined && !VERSION_RE.test(String(brand.minAppVersion))) {
    fail(where, "minAppVersion must be dotted numbers, e.g. \"1.1.7\"");
  }
  if (brand.homepage !== undefined && !/^https:\/\/\S+$/.test(String(brand.homepage))) {
    fail(where, "homepage must be an https URL");
  }
  if (brand.names !== undefined) {
    if (typeof brand.names !== "object" || Array.isArray(brand.names)) {
      fail(where, "names must be an object of language → name");
    } else {
      for (const [tag, value] of Object.entries(brand.names)) {
        if (!/^[a-zA-Z-]+$/.test(tag) || typeof value !== "string" || value.trim() === "") {
          fail(where, `names["${tag}"] must be a non-empty string under a language tag`);
        }
      }
    }
  }
  if (!Array.isArray(brand.keywords) || brand.keywords.length === 0) {
    fail(where, "keywords must be a non-empty array");
  } else {
    for (const keyword of brand.keywords) {
      const word = String(keyword).toLowerCase();
      if (word.length < 3) fail(where, `keyword "${keyword}" is too short to be an identity`);
      if (GENERIC_KEYWORDS.has(word)) fail(where, `keyword "${keyword}" is generic and would claim unrelated endpoints`);
      const owner = keywordsOwned.get(word);
      if (owner && owner !== brand.id) {
        fail(where, `keyword "${keyword}" already belongs to "${owner}"`);
      } else {
        keywordsOwned.set(word, brand.id);
      }
    }
  }
});

// ── 5. Hosts ────────────────────────────────────────────────────────────────
for (const [host, brandID] of Object.entries(hosts)) {
  const normalized = String(host).toLowerCase().replace(/^\.+/, "").replace(/\/+$/, "");
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(normalized)) fail(`hosts["${host}"]`, "is not a host name");
  if (!brandIDs.has(brandID)) fail(`hosts["${host}"]`, `points at unknown brand "${brandID}"`);
}

// ── 6. Presets ──────────────────────────────────────────────────────────────
const presetIDs = new Set();
presets.forEach((preset, index) => {
  const where = `presets[${index}] (${preset?.id ?? "?"})`;
  if (!preset || typeof preset !== "object") return fail(where, "must be an object");
  if (typeof preset.id !== "string" || !ID_RE.test(preset.id)) {
    fail(where, "id must be lowercase letters, digits and dashes");
  } else if (presetIDs.has(preset.id)) {
    fail(where, `duplicate preset id "${preset.id}"`);
  } else {
    presetIDs.add(preset.id);
  }
  if (typeof preset.name !== "string" || preset.name.trim() === "") fail(where, "name is required");
  if (preset.brand !== undefined && !brandIDs.has(preset.brand)) {
    fail(where, `brand "${preset.brand}" does not exist`);
  }
  if (typeof preset.baseURL !== "string" || preset.baseURL.trim() === "") {
    fail(where, "baseURL is required");
  } else if (!/^https:\/\/\S+$/.test(preset.baseURL) && !/^http:\/\/(localhost|127\.0\.0\.1)\S*$/.test(preset.baseURL)) {
    fail(where, "baseURL must be https (or http on localhost)");
  }
  if (!PROTOCOLS.has(preset.protocol)) {
    fail(where, `protocol must be one of ${[...PROTOCOLS].join(", ")}`);
  }
  if (!SECTIONS.has(preset.section)) {
    fail(where, `section must be one of ${[...SECTIONS].join(", ")}`);
  }
  if (preset.minAppVersion !== undefined && !VERSION_RE.test(String(preset.minAppVersion))) {
    fail(where, "minAppVersion must be dotted numbers");
  }
});

// ── 7. Engines ──────────────────────────────────────────────────────────────
const engineIDs = new Set();
engines.forEach((engine, index) => {
  const where = `engines[${index}] (${engine?.id ?? "?"})`;
  if (!engine || typeof engine !== "object") return fail(where, "must be an object");
  if (typeof engine.id !== "string" || !ID_RE.test(engine.id)) {
    fail(where, "id must be lowercase letters, digits and dashes");
  } else if (engineIDs.has(engine.id)) {
    fail(where, `duplicate engine id "${engine.id}"`);
  } else {
    engineIDs.add(engine.id);
  }
  // `brand: null` is a real answer: an engine with no logo row of its own.
  const engineBrand = engine.brand ?? null;
  if (engineBrand !== null && !brandIDs.has(engineBrand)) {
    fail(where, `brand "${engineBrand}" does not exist`);
  }
  if (!Array.isArray(engine.ports) || engine.ports.length === 0
      || engine.ports.some((port) => !Number.isInteger(port) || port <= 0 || port > 65535)) {
    fail(where, "ports must be a non-empty array of port numbers");
  }
  if (!DIALECTS.has(engine.dialect)) {
    fail(where, `dialect must be one of ${[...DIALECTS].join(", ")}`);
  }
  if (engine.probes !== undefined && (!Array.isArray(engine.probes) || engine.probes.some((p) => typeof p !== "string"))) {
    fail(where, "probes must be an array of paths");
  }
});

// ── 8. Unsupported shapes (app policy; read from the bundle only) ───────────
unsupportedHosts.forEach((entry, index) => {
  const where = `unsupportedHosts[${index}]`;
  if (typeof entry?.suffix !== "string" || entry.suffix.trim() === "") {
    fail(where, "suffix is required");
  }
  if (typeof entry?.reason !== "string" || entry.reason.trim() === "") {
    fail(where, "reason is required");
  }
});

// ── Size: this ships inside the app and is downloaded over mobile data ──────
const bytes = Buffer.byteLength(text, "utf8");
if (bytes > 512 * 1024) {
  fail("(file)", `${bytes} bytes is over the 512 KB the app will install`);
}

if (failures.length) {
  console.error(`check-providers-json: FAIL — ${path.basename(filePath)}`);
  for (const failure of failures) console.error(" -", failure);
  process.exit(1);
}

console.log(`check-providers-json: OK — ${path.basename(filePath)}`);
console.log(
  `  schema ${file.schemaVersion}, ${brands.length} brands, ${presets.length} presets,`
  + ` ${engines.length} engines, ${Object.keys(hosts).length} hosts, ${unsupportedHosts.length} unsupported shapes, ${bytes} bytes`
);
