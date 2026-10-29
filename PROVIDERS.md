# Provider list

`providers.json` is the list of providers BayesChat knows about: the "Add Provider"
rows that prefill an endpoint, the brand marks behind them, the host names that
identify an endpoint, and the ports local servers listen on.

It ships inside the app **and** is downloaded from this repository. That download
is why a pull request here is enough to add a provider: a build already in people's
hands picks the file up within a day, with no App Store release.

```
GET https://raw.githubusercontent.com/fan3cn/bayeschat/main/providers.json
```

## Adding yourself

One pull request, one provider. Four things to add, and the validator checks
every one of them:

1. **A brand row** with a stable `id`. This id is what the app stores on the
   user's provider (`brandLogoName`), so it can never be renamed later.
2. **A preset row** that opens your endpoint. This is what appears in
   *Add Provider → Choose Provider*.
3. **Host names**, if an endpoint can be recognised from its base URL.
4. **Keywords**, lowercase fragments matched against the name and base URL the
   user typed.

Then run the validator and paste its output into the pull request:

```bash
node scripts/check-providers.mjs
```

### Logo

A brand without an asset in the app renders as its first letter on the brand
colour, so `hex` is what makes a new provider look right immediately:

- `hex` — your official colour, six hex digits, no `#` (`"412991"` for OpenAI).
- A real logo is an **app asset**, not part of this file: it is added with a
  release (`ProviderLogo<Id>.svg` in the asset catalog, monochrome, trimmed to
  its own outline). Ask in the pull request and it will be picked up in the next
  version. Until then the letter avatar is used, which is deliberate: no remote
  image can change under the app.

### Names in other languages

`name` is the English name and is used as-is everywhere. Optional `names` adds a
translation — today the app reads `zh`:

```json
{ "id": "acme", "name": "Acme AI", "names": { "zh": "阿克米" } }
```

## The format

```jsonc
{
  "schemaVersion": 2,
  "updatedAt": "2026-10-29",          // when the row set changed
  "brands": [
    {
      "id": "acme",                    // [a-z0-9-], stable forever
      "name": "Acme AI",
      "names": { "zh": "阿克米" },      // optional
      "hex": "1A2B3C",                 // letter avatar colour
      "keywords": ["acme"],            // lowercase, not generic words
      "modelsDevIDs": ["acme"],        // optional: models.dev ids this covers
      "kind": "cloud",                 // cloud | local | gateway
      "homepage": "https://acme.ai",   // optional, for reviewers
      "minAppVersion": "1.1.7"         // optional: oldest app that may use row
    }
  ],
  "presets": [
    {
      "id": "acme",                    // one row per endpoint you offer
      "brand": "acme",
      "name": "Acme AI",
      "baseURL": "https://api.acme.ai/v1",
      "protocol": "openAICompatible",  // openAICompatible | anthropic
      "section": "internationalCloud",  // internationalCloud | chineseCloud | localEngines
      "minAppVersion": "1.1.7"
    }
  ],
  "hosts": { "api.acme.ai": "acme" },  // only domains you own
  "engines": [],                       // local servers: ports + probe path + dialect
  "unsupportedHosts": []               // app policy; see below
}
```

Rules the validator enforces:

| Rule | Why |
|---|---|
| `id` matches `[a-z0-9-]+` and is unique | it is stored on the user's device |
| `hex` is six hex digits | it colours the letter avatar |
| `keywords` are specific and unclaimed | a generic keyword (`api`, `ai`, `cloud`) would claim unrelated endpoints |
| `baseURL` is `https` (or localhost `http`) | the key travels there |
| `protocol` / `section` / `dialect` are from the listed sets | a new one is a code change in the app, not data |
| `minAppVersion` is dotted numbers | rows written for a future build are ignored until it ships |
| hosts point at a brand in this file | a host name is identity, not a redirect |

## What a pull request cannot do

- **Rename or rewrite an existing brand.** Ids and brands already shipped win;
  the app merges this file as *additions only*. Editing an existing row is
  reviewed as a separate change with a reason (typo, wrong colour, dead host).
- **Take another provider's host name.** `api.openai.com` already belongs to
  OpenAI; a host is only accepted for a brand that owns that domain.
- **Make an endpoint unusable.** `unsupportedHosts` (shapes that cannot be
  reached with a base URL plus a key, like AWS Bedrock's signed requests) is app
  policy: the app reads it from its own bundle and ignores this file's copy.
- **Add a new protocol, auth scheme or request dialect.** Those are code.

## Versioning

`schemaVersion` describes the shape of the file, not a release of the app. The
app refuses a file whose version it does not know (its bundled copy stays in
force) and drops individual rows it cannot express — so it is always safe to add
`"minAppVersion"` and let older builds ignore the row.

## Review

Pull requests are reviewed by the maintainers. A row may be refused when the
endpoint cannot be reached with a URL and an API key, when the mark or the name
belongs to someone else, or when the domain in `hosts` is not yours. Being listed
is free and is not an endorsement.
