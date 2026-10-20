<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/icon-dark.png">
    <img src="docs/brand/icon.png" width="104" height="104" alt="BayesChat app icon">
  </picture>
</p>

<h1 align="center">BayesChat</h1>

<p align="center"><b>Private iOS AI chat: BYOK, MCP, memory and presets — all on your device.</b></p>

<p align="center">
  <img src="docs/badges/ios.svg" alt="iOS 17 or later">
  <img src="docs/badges/device.svg" alt="Runs on iPhone and iPad">
  <img src="docs/badges/languages.svg" alt="22 languages">
  <img src="docs/badges/pro.svg" alt="Pro is a one-time $14.99 purchase">
  <img src="docs/badges/version.svg" alt="Version 1.1.5, build 48">
</p>

<p align="center">
  <a href="https://apps.apple.com/app/id6777948055"><img src="docs/brand/app-store.svg" height="40" alt="Download on the App Store"></a>
  &nbsp;&nbsp;
  <a href="https://bayeschat.xyz"><img src="docs/badges/website.svg" height="40" alt="bayeschat.xyz"></a>
</p>

<p align="center">
  <a href="docs/">Docs</a> &nbsp;·&nbsp; <a href="#screenshots">Screenshots</a> &nbsp;·&nbsp; <a href="CHANGELOG.md">Changelog</a> &nbsp;·&nbsp; <a href="#support">Support</a>
</p>

**The latest BayesChat news, documentation and release notes live here** — including
the full changelog of what shipped in each version.

---

## BYOK: any provider, any endpoint

Point BayesChat at whatever you already pay for, and manage it from one place.
Nothing is hardcoded — if an endpoint speaks a supported protocol, it works.

- **OpenAI** (Chat Completions and the Responses API), **Anthropic** (Messages),
  **Google Gemini**, **OpenRouter**, plus any **OpenAI-compatible** endpoint
- **Custom base URLs**, with the protocol detected from the URL you paste
- **Local runtimes** — Ollama, LM Studio, llama.cpp server — including Ollama's
  own `keep_alive` handling so your model stays warm between turns
- **Per-provider custom headers**, with `{session_id}` and `{model_id}` placeholders.
  This is what makes multi-protocol gateways usable: point a provider at OpenCode Go
  (`https://opencode.ai/zen/go/v1`) or OpenCode Zen (`https://opencode.ai/zen/v1`), add
  `x-opencode-session: {session_id}` once, and every conversation gets its own stable
  session id. Each model on that gateway is then routed to the protocol it actually
  speaks — Chat Completions, Anthropic Messages or OpenAI Responses — instead of one
  wire format being forced on the whole endpoint.
- **Live model lists** — the picker shows what your key can actually call, not a
  hardcoded table
- Keys live in the **Keychain**, never in plain files

## MCP: real tools on the phone

Most MCP tooling stops at the desktop. BayesChat connects to **remote MCP servers
over Streamable HTTP** and runs their tools inside the conversation.

- Add a server, choose **bearer token** or **custom headers**, then **Validate &
  Fetch Tools** — you see the connection succeed and the tool list arrive
- **Toggle tools individually**, so a server can expose twenty and the model only
  gets the three you want
- Every call renders **inline** with its arguments, latency, token delta and
  result — expandable, copyable, cancellable
- **Concurrent calls** within a round instead of a queue, **retry in place** when
  one fails, and a **Continue** prompt when a model stops after calling tools
  without writing its final answer
- Long tool output is truncated intelligently instead of blowing out the context

> iOS cannot spawn child processes, so **stdio servers don't apply**. Remote HTTP
> servers do — and that's the whole design.

## Chat Presets: the whole request, saved

A preset is not a saved prompt. It's the entire configuration for one kind of
task, switched in one tap.

- **Save the prompt, model, parameters, memory and tools as one reusable preset, then
  switch presets in a single tap** — Translator to Research changes everything above
  at once, not just the words of the prompt.
- Prompt variables such as `{{current_date}}`, `{{current_time}}`, `{{current_weekday}}`,
  `{{current_datetime}}`, `{{timezone}}` and `{{model_id}}` are resolved at send time.
- A preset can inherit your global parameters or override them individually.
- Each preset has its own icon and description; one can be marked as the default.
- The composer only shows the parameters that differ from the defaults, so a tuned
  preset looks different at a glance.

## Memory: long-term context you can read

Memory is not a black box that quietly rewrites your prompt.

- Learned from your conversations, then **merged under explicit capacity and
  protection rules** instead of blindly appended
- Every entry is **visible, editable and deletable** — you can fix what it got
  wrong, or delete a single fact without wiping everything
- Shown as a **pill in the composer** so you always know whether memory is active
  for this conversation
- Settles **inside the same run as the answer**, so a finished reply means the
  memory is finished too

## Background tasks: leave the app, nothing stops

Long answers and multi-step tool runs **keep going after you send the app to the
background**, with progress on the **Lock Screen and in the Dynamic Island** —
including a cancel control.

- Built on iOS 26's continued-processing API, so the network stays alive instead
  of being suspended
- **Live Activity** shows what's running and how far along it is
- **Opt-in notification** when it finishes; tapping it opens the conversation
  that finished
- Conversation title and memory updates are finished **inside the same background
  run**, so nothing is half-written when you come back
- On older iOS versions the app falls back to the normal background grace period

## Privacy: nothing leaves the device

The product promise is verifiable, not just stated.

- **No account, no sign-up, no identity** — nothing to log in to
- Requests go to exactly two kinds of hosts: the provider endpoint you configured,
  and the MCP servers you added. Nothing else
- Conversations, presets and memory are stored **locally on the device**
- API keys and MCP credentials in the **Keychain**
- **No tracking, no analytics SDK, no third-party telemetry** — the app's privacy
  manifest declares no collected data types and no tracking domains
- Export and back up your data and take it with you, without asking anyone

---

## Screenshots

<p align="center">
  <img src="docs/screenshots/01-hero-privacy.webp" width="240">
  <img src="docs/screenshots/02-byok-providers.webp" width="240">
  <img src="docs/screenshots/03-chat-presets.webp" width="240">
</p>

<p align="center"><sub><b>A private AI chat workspace</b> \&nbsp;·\&nbsp; <b>Any provider, local or cloud</b> \&nbsp;·\&nbsp; <b>Presets store prompts, models, parameters and tools</b></sub></p>

<p align="center">
  <img src="docs/screenshots/04-mcp-add-server.webp" width="240">
  <img src="docs/screenshots/05-mcp-tool-call.webp" width="240">
  <img src="docs/screenshots/06-markdown-latex.webp" width="240">
</p>

<p align="center"><sub><b>Add a remote MCP server and fetch its tools</b> \&nbsp;·\&nbsp; <b>MCP tool calls, fully expanded</b> \&nbsp;·\&nbsp; <b>Markdown, LaTeX, code and tables</b></sub></p>

<p align="center">
  <img src="docs/screenshots/07-parameters.webp" width="240">
  <img src="docs/screenshots/08-themes-sepia.webp" width="240">
  <img src="docs/screenshots/09-background-dynamic-island.webp" width="240">
</p>

<p align="center"><sub><b>Sampling controls, per preset</b> \&nbsp;·\&nbsp; <b>Themes and typography</b> \&nbsp;·\&nbsp; <b>Answers keep running in the background, live in the Dynamic Island</b></sub></p>

## Everything else

|                          |                                                                                                                                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reasoning models**     | `<thinking>` tags and `reasoning` / `thinking` fields parsed and rendered as their own block, collapsible and copyable                                                                                |
| **Parameters**           | Temperature · Top P · Top K · Min P · Max Tokens · reasoning effort (low / medium / high) · penalties · seed · stop sequences · raw provider JSON — every knob your provider exposes, no config files |
| **Rendering**            | Markdown, KaTeX math, syntax-highlighted code, tables — with a steady typewriter reveal and lighter transcript typography                                                                             |
| **Attachments**          | Images, video and documents; tap a photo to open the **original resolution**, not the compressed preview                                                                                              |
| **Streaming detail**     | Live `tok/s`, latency and up/down token counts under every reply                                                                                                                                      |
| **Composer**             | Auto-grows with your text, expands into a full-screen editor, submits with the keyboard Send key, with parameter / reasoning / memory / preset pills in one row                                       |
| **Conversation control** | AI-generated titles, edit and regenerate, long-press to edit / copy / delete, pinned message that holds still while cards expand                                                                      |
| **Navigation**           | Slide-out history drawer from the left edge, jump-to-bottom that appears only when it's needed                                                                                                        |
| **Export**               | Batch export conversations to **PDF or HTML** (zip), plus a full local backup                                                                                                                         |
| **Appearance**           | Light and dark, six transcript themes including sepia, adjustable typography                                                                                                                          |
| **Localisation**         | **22 languages**, including Simplified and Traditional Chinese                                                                                                                                        |
| **Onboarding**           | A setup guide that gets you from install to first answer, and a What's New card after each update                                                                                                     |

## Requirements and limits

- **iOS / iPadOS 17 or later.** Background continuations and the Live Activity
  require **iOS 26**.
- **Remote MCP servers only.** iOS cannot spawn local processes, so `stdio`
  servers are not supported by any iOS client — including this one.
- The model does the thinking. BayesChat does not proxy, resell or route your
  requests through anyone.

## Support

- **Bugs and questions:** [open an issue](https://github.com/fan3cn/bayeschat/issues) — that's the main channel
- **Email:** <bayeschat@gmail.com>, for anything you'd rather not post publicly
- **Privacy policy:** [bayeschat.xyz/privacy.html](https://bayeschat.xyz/privacy.html) is the canonical page ([why this repo only links to it](docs/privacy.md))
- **What changed in each release:** [CHANGELOG.md](CHANGELOG.md)

When reporting a problem, please include the app version, your device model, the
iOS or iPadOS version, the provider and model you were using, and whether MCP was
involved. Those five details turn a "it doesn't work" into something fixable.
