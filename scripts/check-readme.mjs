#!/usr/bin/env node
// Rails for the README header: every fact and every file it points at.
//
//   node scripts/check-readme.mjs
//
// The header is a small set of static claims — OS floor, devices, language
// count, price, version — plus artwork. Nothing renders it in CI, so the ways
// it can rot are exactly the ways a human would not notice:
//
//   1. The version badge keeps saying v1.1.4 after the changelog moved on. It is
//      derived from CHANGELOG.md, so this check just re-derives it.
//   2. A badge or logo file is renamed or deleted and the README shows a broken
//      image on GitHub, where nobody reloads the page to look.
//   3. The icon is replaced with a new one that lost its baked-in iOS corner
//      mask. In dark mode that reads as a pasted black square, which is subtle
//      enough to ship. The pins below catch it; regenerate intentionally and
//      update them.
//   4. An asset is added to docs/badges or docs/brand and never referenced, or
//      removed from the README and left behind.
//
// Exit 0 = the header can be trusted, 1 = something above is wrong.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readRelease, renderVersionBadge } from './sync-version-badge.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readmePath = path.join(root, 'README.md');
const readme = readFileSync(readmePath, 'utf8');
const changelog = readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');

/** Artwork whose bytes are load-bearing, not just present. */
const PINS = {
  // Rounded corners baked in (iOS 22.37% mask, transparent outside). The
  // unrounded originals live in the landing repo's assets/brand; see
  // docs/readme.md for the regeneration command.
  'docs/brand/icon.png': '00b7729cd21594d2f374604f6afedc651d508b2d45bc420557c52ee497256d94',
  'docs/brand/icon-dark.png': 'e7e07501944acce924d8cde6e944711810598c4334203b16da4d632453a9ed9b',
  // Apple's own "Download on the App Store" badge, unmodified.
  'docs/brand/app-store.svg': 'a26fc5b38380272c92e9019a2eb8b45542a66814b3e2b203772db8904b9fb99f',
};

const failures = [];
const fail = (message) => failures.push(message);

// 1. Version badge follows the changelog.
const release = readRelease(changelog);
const badgeFile = 'docs/badges/version.svg';
if (!existsSync(path.join(root, badgeFile))) {
  fail(`${badgeFile} is missing`);
} else if (readFileSync(path.join(root, badgeFile), 'utf8') !== renderVersionBadge(release)) {
  fail(
    `${badgeFile} does not match CHANGELOG.md (v${release.version} · build ${release.build}); ` +
      'run node scripts/sync-version-badge.mjs'
  );
}

// 2. Every referenced image exists, and every shipped asset is referenced.
const referenced = new Set();
for (const match of readme.matchAll(/(?:src|srcset)="([^"]+)"/g)) {
  for (const candidate of match[1].split(',')) {
    const src = candidate.trim().split(/\s+/)[0];
    if (!src || /^(https?:)?\/\//.test(src) || src.startsWith('data:')) continue;
    referenced.add(src);
    if (!existsSync(path.join(root, src))) fail(`README references ${src}, which does not exist`);
  }
}

for (const dir of ['docs/badges', 'docs/brand']) {
  for (const name of readdirSync(path.join(root, dir))) {
    const rel = `${dir}/${name}`;
    if (!referenced.has(rel)) fail(`${rel} is committed but no README image uses it`);
  }
}

// 3. Artwork bytes are what the header assumes.
for (const [rel, expected] of Object.entries(PINS)) {
  const file = path.join(root, rel);
  if (!existsSync(file)) {
    fail(`${rel} is missing`);
    continue;
  }
  const actual = createHash('sha256').update(readFileSync(file)).digest('hex');
  if (actual !== expected) {
    fail(
      `${rel} changed (sha256 ${actual.slice(0, 12)}…).\n` +
        '    If the new art is intentional, update PINS in scripts/check-readme.mjs.\n' +
        '    If the icon was replaced, re-bake the corner mask first — see docs/readme.md.'
    );
  }
}

// 4. The claims that a machine can check here. The language count and the price
//    live in the app repo and the store listing, so they stay manual: pinning
//    them would only move the place where they go stale.
for (const [needle, why] of [
  ['docs/badges/ios.svg', 'the iOS floor badge'],
  ['docs/badges/device.svg', 'the device badge'],
  ['docs/badges/languages.svg', 'the language badge'],
  ['docs/badges/pro.svg', 'the price badge'],
  ['docs/brand/app-store.svg', 'the App Store badge'],
  ['https://bayeschat.xyz', 'the website button'],
]) {
  if (!readme.includes(needle)) fail(`README no longer shows ${why} (${needle})`);
}

if (failures.length) {
  console.error('check-readme: FAIL');
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

const images = [...readme.matchAll(/<img\s/g)].length;
console.log(
  `check-readme: OK — v${release.version} · build ${release.build}, ` +
    `${images} images, ${Object.keys(PINS).length} pinned files`
);
