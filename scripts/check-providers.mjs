#!/usr/bin/env node
/**
 * Validator for `providers.json` — the provider list the app ships with and
 * downloads from this repository.
 *
 * Exit 0 = the file may be installed by every build that reads schema 3.
 * Exit 1 = violations, each with a path into the file.
 *
 * Usage:
 *   node scripts/check-providers.mjs [path]
 *
 * The rules, and why each one exists:
 *
 *  1. Shape. `schemaVersion` is 3 and `generatedAt` is a date the app can show.
 *     A version the app does not know is refused whole.
 *  2. Size. Between 10 and 200 rows: a catalog that lost almost everything is a
 *     bad publish, and a runaway list is a different problem.
 *  3. Identity. Ids are unique, lowercase and boring — they are persisted on the
 *     user's device and used as file names, so `../etc/passwd` cannot be one.
 *  4. Endpoints. `baseURL` is https, has a host, and is not a local address. The
 *     app sends an API key there; plain http and loopback are not acceptable.
 *  5. Protocol. `openAICompatible` or `anthropic`. A new one is a code change in
 *     the app, not a row.
 *  6. Keywords are how a hand-made provider is recognised. They are lowercase
 *     (the app lowercases what it matches), they cannot be generic words, and no
 *     two rows may claim the same one.
 *  7. Hosts are identity: two rows may not share one, or the app would have to
 *     pick a winner.
 *  8. Marks. `asset:<id>` may only name the row's own id — nobody borrows an
 *     existing app asset. A downloadable mark is `providers/logos/<id>.png`: a
 *     real PNG, small, roughly square, and present in this repository. Absolute
 *     URLs and `..` are refused, because the app only fetches from this host.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const filePath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, "providers.json");

const SCHEMA = 3;
const MIN_ROWS = 10;
const MAX_ROWS = 200;
const MAX_MARK_BYTES = 512 * 1024;
const MIN_MARK_SIDE = 16;
const MAX_MARK_SIDE = 1024;
const MAX_MARKS = 64;
const PROTOCOLS = ["openAICompatible", "anthropic"];
const ID_RE = /^[a-z0-9][a-z0-9._-]{0,39}$/;
const GENERIC_KEYWORDS = new Set([
  "api", "ai", "llm", "cloud", "chat", "model", "models", "server", "proxy",
  "gateway", "completion", "completions", "localhost",
]);

const violations = [];
const report = (where, message) => violations.push(`${where}: ${message}`);

if (!fs.existsSync(filePath)) {
  console.error(`missing catalog: ${filePath}`);
  process.exit(1);
}

let catalog;
try {
  catalog = JSON.parse(fs.readFileSync(filePath, "utf8"));
} catch (error) {
  console.error(`providers.json is not valid JSON: ${error.message}`);
  process.exit(1);
}

// ── 1. Shape ────────────────────────────────────────────────────────────────
if (catalog.schemaVersion !== SCHEMA) {
  report("schemaVersion", `must be ${SCHEMA}, found ${catalog.schemaVersion}`);
}
if (typeof catalog.generatedAt !== "string" || Number.isNaN(Date.parse(catalog.generatedAt))) {
  report("generatedAt", "must be an ISO 8601 date");
}
if (!Array.isArray(catalog.providers)) {
  console.error("providers: must be an array");
  process.exit(1);
}

// ── 2. Size ─────────────────────────────────────────────────────────────────
if (catalog.providers.length < MIN_ROWS || catalog.providers.length > MAX_ROWS) {
  report("providers", `must hold ${MIN_ROWS}…${MAX_ROWS} rows, found ${catalog.providers.length}`);
}

const ids = new Set();
const names = new Set();
const keywords = new Map();
const hosts = new Map();
let marks = 0;

catalog.providers.forEach((row, index) => {
  const where = `providers[${index}]`;
  const id = typeof row.id === "string" ? row.id : "";
  const label = `${where} (${id || "no id"})`;

  // ── 3. Identity ───────────────────────────────────────────────────────────
  if (!ID_RE.test(id)) {
    report(`${where}.id`, `must match ${ID_RE}, found ${JSON.stringify(row.id)}`);
  } else if (ids.has(id)) {
    report(`${where}.id`, `duplicate id ${id}`);
  }
  ids.add(id);

  if (typeof row.name !== "string" || !row.name.trim()) {
    report(`${where}.name`, "must be a non-empty string");
  } else if (row.name.length > 60) {
    report(`${where}.name`, "must be at most 60 characters");
  } else if (names.has(row.name)) {
    report(`${where}.name`, `duplicate name ${row.name}`);
  } else {
    names.add(row.name);
  }

  // ── 4. Endpoint ───────────────────────────────────────────────────────────
  let host = null;
  if (typeof row.baseURL !== "string" || !row.baseURL.startsWith("https://")) {
    report(`${where}.baseURL`, "must start with https://");
  } else {
    try {
      host = new URL(row.baseURL).host.toLowerCase();
    } catch {
      report(`${where}.baseURL`, "is not a URL");
    }
    if (host && (host === "localhost" || host === "0.0.0.0" || host.startsWith("127."))) {
      report(`${where}.baseURL`, "must not be a local address");
    }
  }

  // ── 5. Protocol ───────────────────────────────────────────────────────────
  if (!PROTOCOLS.includes(row.protocol)) {
    report(`${where}.protocol`, `must be one of ${PROTOCOLS.join(", ")}, found ${row.protocol}`);
  }

  if (!Array.isArray(row.modelsDevIDs)) {
    report(`${where}.modelsDevIDs`, "is required (use [] when models.dev has no entry)");
  } else if (row.modelsDevIDs.length > 8) {
    report(`${where}.modelsDevIDs`, "must hold at most 8 ids");
  }

  // ── 6. Keywords ───────────────────────────────────────────────────────────
  if (row.keywords !== undefined) {
    if (!Array.isArray(row.keywords)) {
      report(`${where}.keywords`, "must be an array");
    } else {
      if (row.keywords.length > 8) report(`${where}.keywords`, "must hold at most 8 entries");
      for (const keyword of row.keywords) {
        if (typeof keyword !== "string" || keyword.length === 0 || keyword.length > 40) {
          report(`${where}.keywords`, `invalid entry ${JSON.stringify(keyword)}`);
          continue;
        }
        if (keyword !== keyword.toLowerCase()) {
          report(`${where}.keywords`, `${keyword} must be lowercase`);
        }
        if (GENERIC_KEYWORDS.has(keyword.toLowerCase())) {
          report(`${where}.keywords`, `${keyword} is too generic to identify an endpoint`);
        }
        const owner = keywords.get(keyword);
        if (owner && owner !== id) {
          report(`${where}.keywords`, `${keyword} is already claimed by ${owner}`);
        }
        keywords.set(keyword, id);
      }
    }
  }

  // ── 7. Host ───────────────────────────────────────────────────────────────
  if (host) {
    const owner = hosts.get(host);
    if (owner && owner !== id) {
      report(`${where}.baseURL`, `${host} is already claimed by ${owner}`);
    }
    hosts.set(host, id);
  }

  // ── 8. Mark ───────────────────────────────────────────────────────────────
  const logo = row.logo;
  if (logo === undefined || logo === null || logo === "") return;
  if (typeof logo !== "string") {
    report(`${where}.logo`, "must be a string");
    return;
  }

  if (logo.startsWith("asset:")) {
    const assetID = logo.slice("asset:".length);
    if (assetID !== id) {
      report(`${where}.logo`, `an app asset may only be named after the row itself (${id})`);
    }
    return;
  }

  marks += 1;
  const expected = `providers/logos/${id}.png`;
  if (logo !== expected) {
    report(`${where}.logo`, `must be ${expected}`);
  }
  if (logo.includes("://") || logo.startsWith("/") || logo.split("/").some((part) => part === "." || part === "..")) {
    report(`${where}.logo`, "must be a relative path inside this repository");
    return;
  }

  const file = path.join(root, logo);
  if (!fs.existsSync(file)) {
    report(`${where}.logo`, `file is missing (${logo})`);
    return;
  }
  const bytes = fs.readFileSync(file);
  if (bytes.length > MAX_MARK_BYTES) {
    report(`${where}.logo`, `is ${Math.round(bytes.length / 1024)} KB, over the ${MAX_MARK_BYTES / 1024} KB limit`);
  }
  const isPNG = bytes.length > 24
    && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (!isPNG) {
    report(`${where}.logo`, "is not a PNG");
    return;
  }
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  const longest = Math.max(width, height);
  const shortest = Math.min(width, height);
  if (longest > MAX_MARK_SIDE || shortest < MIN_MARK_SIDE) {
    report(`${where}.logo`, `is ${width}×${height}, outside ${MIN_MARK_SIDE}…${MAX_MARK_SIDE} px`);
  }
});

if (marks > MAX_MARKS) {
  report("providers", `must reference at most ${MAX_MARKS} downloadable marks, found ${marks}`);
}

if (violations.length) {
  console.error(`FAIL: ${violations.length} problem(s) in ${path.relative(root, filePath)}`);
  for (const violation of violations) console.error(`  - ${violation}`);
  process.exit(1);
}

console.log(
  `PASS: ${catalog.providers.length} providers, ${marks} downloadable mark(s), schema ${catalog.schemaVersion}.`
);
