# Provider list

`providers.json` is the list of providers BayesChat offers when you add one: a
row per endpoint, prefilled with the name, the base URL and the protocol, plus a
mark to show beside it.

It ships inside the app **and** is downloaded from this repository, so a pull
request here reaches people who already have the app: it is picked up by the
daily check, or straight away from *Settings → Provider Data → Check for
Updates*. No App Store release.

```
GET https://raw.githubusercontent.com/fan3cn/bayeschat/main/providers.json
```

## Adding yourself

One pull request, one provider. Add a row to the `providers` array, bump
`generatedAt`, and add a PNG if you have no bundled mark:

```json
{
  "id": "foo",
  "name": "Foo AI",
  "baseURL": "https://api.foo.ai/v1",
  "protocol": "openAICompatible",
  "modelsDevIDs": ["foo"],
  "keywords": ["foo"],
  "logo": "providers/logos/foo.png"
}
```

| Field | Required | Rules |
|---|---|---|
| `id` | yes | lowercase ASCII, `[a-z0-9][a-z0-9._-]*`, up to 40 characters, **never renamed**. It is what the app stores on the user's provider, and the name your mark is cached under |
| `name` | yes | English name, up to 60 characters, unique in the file |
| `baseURL` | yes | an `https://` API root, **without** `/chat/completions`; whether it ends in `/v1` follows your docs |
| `protocol` | yes | `openAICompatible` or `anthropic`. Anything else is a code change in the app, not data |
| `modelsDevIDs` | yes | the [models.dev](https://models.dev) provider ids this row covers (`[]` if none). A row without this field is refused |
| `keywords` | no | defaults to `[id]`. Lowercase fragments matched against the name and base URL a user typed, so their hand-made provider picks up your mark. Must not collide with another row |
| `logo` | no | a relative PNG path, `providers/logos/<id>.png`. Omit it when the mark ships inside the app — a bundled mark is named after the row and needs no field. **Absolute URLs, `asset:` references and `..` are refused** |

`generatedAt` is the date the row set changed (`2026-10-29T07:10:34Z`). The app
shows it as when the list was last updated.

## Logo

- PNG, transparent background, **one colour** (the app renders it as a tinted
  glyph, so the colour comes from the theme and only the shape survives).
- Up to 512 KB, shortest side at least 16 px, longest side at most 1024 px.
- Put it at `providers/logos/<id>.png` and reference it from the row as
  `providers/logos/<id>.png`.
- A wordmark, a gradient, or a mark with its own background will be flattened
  into a blob. A glyph trimmed to its own outline is what looks right.
- A mark that ships inside the app is an imageset named after the row
  (`ProviderLogo<Id>`). Leave `logo` out and it is used automatically; there is
  no field for pointing a row at someone else's.

Until the PNG arrives the row shows the first letter of its name, which is a
deliberate fallback rather than an error.

## What a pull request cannot do

- **Rename or rewrite an existing row.** `id`s are persisted on user devices; a
  new id is a new provider. Correcting a typo in a name or a dead URL is fine —
  say so in the description.
- **Take another provider's endpoint or keyword.** A keyword belongs to the row
  that owns it. A host may serve more than one endpoint of the same vendor
  (OpenCode Zen and Go share one), but the full base URL may only appear once.
- **Add a protocol, an auth scheme or a URL rewrite.** Those live in the app.
  If your endpoint cannot be called with a base URL plus an API key (signed
  requests, a resource name in the host, an OAuth exchange), it cannot be a row
  here — see the notes in the app's pull request.
- **Point a mark at another host.** Downloadable marks are only fetched from
  this repository.

## Before you open the pull request

```bash
node scripts/check-providers.mjs
```

It checks the whole file — ids, endpoints, protocols, keyword ownership, mark
paths and sizes — and prints one line per violation. CI runs the same script on
this pull request. Paste its output in the description.

## After it merges

Merging to `main` publishes the file. Users get it on the next daily check, or
immediately from *Settings → Provider Data*. Reverting the pull request removes
it again on the next check.

Being listed is free and is not an endorsement.
