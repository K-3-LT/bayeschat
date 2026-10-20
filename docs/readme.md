# The README header

`README.md` opens with a centred block: a cover image, fact badges, an App Store
badge, a website button and jump links. Everything in it is a static file in this
repo — the badges are committed SVG, not `img.shields.io` URLs.

The cover is rendered in the landing repo (`og-readme-template.html`, drawn by
`scripts/render-og-variants.sh` in the same system Chrome that measures the type)
and synced here as webp. It is its own dark surface, so one file covers GitHub's
light and dark themes; that is also why there is no separate logo plus `<h1>` above
it — the cover carries the wordmark, and its `alt` text carries the pitch.

That is a deliberate choice. The product's claim is "no tracking, no analytics
SDK, no third-party telemetry", so its own front page should not fetch images
from a third-party server every time somebody loads it.

## What lives where

| Path | What it is |
| --- | --- |
| `docs/brand/readme-banner.webp` | The 1280x320 cover, rendered from `og-readme-template.html` |
| `docs/brand/app-store.svg` | Apple's own "Download on the App Store" badge, unmodified |
| `docs/badges/*.svg` | The fact badges and the website button, drawn here |

`docs/screenshots/*.webp` are the App Store marketing frames shown further down the
README. They are not cropped by hand: they are the generated frames at 2x the width
the README displays them, re-encoded to webp. Regenerate the whole set from the
landing repo:

```bash
# in bayeschat-landing
python3 appstore-screenshot-generator/generate_appstore_screenshot.py --date 20260827 --device iphone-6.9
python3 appstore-screenshot-generator/generate_appstore_screenshot.py --date 20261020 --device iphone-6.9
bash scripts/render-og-variants.sh      # re-renders the cover among the other cards
bash scripts/sync-readme-assets.sh      # writes the cover and screenshots here
```

`sync-readme-assets.sh` holds the slug to frame map, so a new screenshot is one line
there plus one `<img>` in the README.

## The claims in the badges

Five badges, all of them checkable facts, none of them vanity:

| Badge | Where the truth lives |
| --- | --- |
| `iOS 17+` | `IPHONEOS_DEPLOYMENT_TARGET` in the app project |
| `iPhone & iPad` | `TARGETED_DEVICE_FAMILY` in the app project |
| `22 languages` | `LanguageSettings.supported` in the app repo |
| `Pro $14.99 once` | The App Store listing and the site's pricing section |
| `v1.1.5 · build 48` | Derived — see below |

There is deliberately no CI, coverage, downloads or license badge. The repository
has no CI and no `LICENSE` file, so those would either be fabricated or need a
dynamic badge service.

## Keeping it honest

The version badge is the only part that changes on its own schedule, so it is not
written by hand. It is derived from `CHANGELOG.md`, which the release step copies
into this repository anyway: the newest `## [x.y.z]` heading gives the marketing
version, its metadata comment gives the build.

```bash
node scripts/sync-version-badge.mjs          # rewrite docs/badges/version.svg
node scripts/check-readme.mjs                # exit 0 = the whole header is consistent
```

`check-readme.mjs` fails when:

- the version badge disagrees with `CHANGELOG.md`;
- the README references an image that is not in the repository, or an asset in
  `docs/badges` / `docs/brand` is committed but unused;
- the cover or Apple's badge have different bytes than the pins in the script —
  which is what makes a re-rendered cover get looked at instead of shipped blind;
- one of the five badges or the website button has been dropped from the header.

The release step runs both commands after copying `CHANGELOG.md`; see the app
repository's `AGENTS.md`.

## Changing the artwork

`bayeschat-landing` owns brand art. Edit `og-readme-template.html` there, run
`scripts/render-og-variants.sh` (system Chrome, transparent outside the rounded
card), then `scripts/sync-readme-assets.sh` to re-encode and copy it here. Update
the `docs/brand/readme-banner.webp` pin in `scripts/check-readme.mjs` to the sha256
the check reports — after looking at the image, since a re-render reflows type.

A new badge is the same shape as the existing ones: an opaque pill, white
600-weight text, `#3C5FBE` fill (white text clears 4.5:1 on it), 20px tall, width
`24 + 6.4` per character.
