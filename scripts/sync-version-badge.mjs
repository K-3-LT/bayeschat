#!/usr/bin/env node
// Regenerate docs/badges/version.svg from CHANGELOG.md.
//
// The changelog is the one place a release is declared: its newest `## [x.y.z]`
// heading carries the marketing version and its metadata comment carries the
// build (`<!-- build 48 | ... -->`). Reading both here means the badge cannot
// disagree with the notes, and the release step stays a copy plus two commands.
//
//   node scripts/sync-version-badge.mjs          # rewrite the badge
//   node scripts/sync-version-badge.mjs --check  # exit 1 if it is stale
//
// The SVG is hand-drawn, not a shields.io URL: the product sells "no third-party
// requests", so its own README should not fetch images from someone else's
// server on every view.

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const changelogPath = path.join(root, 'CHANGELOG.md');
const badgePath = path.join(root, 'docs/badges/version.svg');

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const INK = '#24292F';

export function readRelease(changelog) {
  const version = changelog.match(/^## \[(\d+\.\d+\.\d+)\]/m)?.[1];
  const build = changelog.match(/^<!-- build (\d+) \|/m)?.[1];
  if (!version) throw new Error('no "## [x.y.z] - date" heading found in CHANGELOG.md');
  if (!build) throw new Error('no "<!-- build N | ... -->" metadata found under the newest release');
  return { version, build };
}

function badgeSvg(text, { bg = INK, size = 11, height = 20, pad = 22, perChar = 6.4 } = {}) {
  const width = Math.round([...text].length * perChar + pad);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${text}">
  <title>${text}</title>
  <rect width="${width}" height="${height}" rx="5" fill="${bg}"/>
  <text x="${width / 2}" y="${height / 2}" font-family="${FONT}" font-size="${size}" font-weight="600"
        fill="#FFFFFF" text-anchor="middle" dominant-baseline="central" letter-spacing="0.2">${text}</text>
</svg>
`;
}

export function renderVersionBadge({ version, build }) {
  return badgeSvg(`v${version} \u00b7 build ${build}`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const check = process.argv.includes('--check');
  const release = readRelease(readFileSync(changelogPath, 'utf8'));
  const expected = renderVersionBadge(release);
  let current = '';
  try {
    current = readFileSync(badgePath, 'utf8');
  } catch {
    // Missing badge is the same failure as a stale one, reported below.
  }

  if (current === expected) {
    console.log(`version badge OK: v${release.version} · build ${release.build}`);
  } else if (check) {
    console.error(
      `version badge is stale: CHANGELOG.md says v${release.version} · build ${release.build}.\n` +
        'Run: node scripts/sync-version-badge.mjs'
    );
    process.exit(1);
  } else {
    writeFileSync(badgePath, expected);
    console.log(`version badge written: v${release.version} · build ${release.build}`);
  }
}
