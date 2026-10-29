# Provider list

`providers.json` is the list behind *Choose Provider* in BayesChat. One row per
endpoint: name, base URL, protocol, and an optional logo.

The app downloads this file when someone opens *Choose Provider*, so **merging a
pull request here publishes a provider** — no App Store release. Requires
BayesChat **1.1.7 or later**.

## The pull request

Fork, branch (`provider/<id>`), then:

```
providers.json              one row added, generatedAt bumped (when the set changed)
providers/logos/<id>.png    new, if the mark is not built into the app
```

Run the validator from the repository root — it must exit 0, and CI runs the
same script — and paste its output in the PR description:

```bash
node scripts/check-providers.mjs
```

Open it against `main`: <https://github.com/fan3cn/bayeschat/compare>
Title it `feat(providers): add <Name>`. In the description say who you are, what
the endpoint is, and whether users need any header beyond a Bearer key. One
provider per pull request.

## The row

```json
{ "id": "foo", "name": "Foo AI", "baseURL": "https://api.foo.ai/v1",
  "protocol": "openAICompatible", "modelsDevIDs": [], "keywords": ["foo"],
  "logo": "providers/logos/foo.png" }
```

| Field | Rules |
|---|---|
| `id` | lowercase `[a-z0-9._-]`, 40 chars max, **never renamed** — it is stored on the user's device and names the logo file |
| `name` | English name, 60 chars max, unique in the file |
| `baseURL` | `https://` API root, without `/chat/completions` |
| `protocol` | `openAICompatible` or `anthropic` |
| `modelsDevIDs` | your [models.dev](https://models.dev) provider ids; `[]` if you are not listed there |
| `keywords` | optional, lowercase fragments matched against the name and URL a user types, so their own entry picks up your logo; defaults to `[id]`, may not collide |
| `logo` | optional; `providers/logos/<id>.png` |

## The logo

- PNG, transparent background, **one colour** — the app renders it as a tinted glyph, so a detailed wordmark becomes a blob.
- 512 KB max, 16–1024 px.
- Omit `logo` only if the mark already ships inside the app.

## Not accepted

- A host with a resource name, signed request or OAuth exchange — it cannot be reached with a base URL plus a key.
- Another provider's endpoint or keyword; the full base URL must be unique.
- A logo hosted anywhere but this repository.

## How it works

- A user opens *Choose Provider*; the app asks for this file, in the background, while the list they already have stays on screen.
- A valid file replaces the list in place. A slow, failed or malformed one changes nothing — the user keeps the previous list and adds their provider as usual.
- Merging to `main` publishes it; reverting the pull request removes it the same way, on the next open.

Being listed is free and is not an endorsement.
