# Changelog

All notable changes to BayesChat are recorded in this file. The format follows the
style used by Pi: a `[version] - date` heading, a fixed section vocabulary, and one
entry per change with the commits it came from.

This file is the single source of truth; the App Store "What's New" text and the
public support changelog are derived from it rather than written separately. The
format rules live in the header of `scripts/check-changelog-format.mjs`, and the
release and publish steps in `AGENTS.md`.

## [Unreleased]

### New Features

- Long chats and tool calls keep running after you leave the app on iOS 26, with progress on the Lock Screen and in the Dynamic Island (2bad883)
- An opt-in notification when a response finishes while you are away, and tapping it opens the conversation that finished (2bad883)

### Changed

- AI titles and long-term memory settle inside the same background run as the answer, so the conversation is fully updated when you return (2bad883)
- The composer keeps a separate parameters pill beside the reasoning pill, showing only sampling values that differ from the defaults (27c9ee4)

### Fixed

- Background tool runs keep their provider credential while the screen is locked, instead of failing the next model round with a 401 (2bad883)
- A model that stops after its tools without writing a final answer now offers Continue instead of ending silently (2bad883)
- The background task card switches to Done together with its completion icon, instead of still saying it is finishing (2bad883)
- The jump-to-bottom button returns as soon as a background reply settles, without reopening the conversation (2bad883)

## [1.1.4] - 2026-10-19

<!-- build 47 | since 1.1.3 (2317018) | 2317018..e87ee13 | 38 commits -->

### New Features

- Long-term memory about the user, a Pro feature (d5d1924)
- Retry a failed tool call in place, narrated on the card (5945888)

### Added

- Memory pill in the composer, folded in with the two parameter pills (528eaa1)
- Settings split into Chat and Tools by what each row changes (7c7207d)
- What's New scrolls on into the previous releases, and About reopens the card on demand (58989f7, bd33c57)

### Changed

- Tool calls in one round run concurrently instead of in a queue (c3cc621)
- Steady fractional typewriter reveal with closed-loop fade-in spans (9a47f30)
- A user bubble's text and pictures share one collapsed height (eb5cf0f)
- The history drawer list is grouped in the cache, not in the body (e079dc8)
- About names Memory and Presets in its tagline, with wording aligned to the website (87ad8d1)
- About shows its version and build line in English in every language (e87ee13)

### Fixed

- A finishing stream no longer disarms Stop (2ed4188)
- The selected preset now means what it says (81c6890)
- Memory deletion reads and lands correctly, and the Memory row is locked for non-Pro users (17bb4e0, 51a010c)
- A translation that matches the English key is kept (5ef6c9f)
- The history drawer snapshot stays in step with title summaries (a27db45)
- Pro opens from the free-limit alert (d901dca)
- The reasoning pill glyph has real weight (9dc848e)
- A dark shadow no longer flashes over Settings on a sheet swipe (9b4c32a)
- The theme row keeps its scroll when picking a theme (6ede5ef)
- The `succeeded on attempt N` tool subtitle is gone (089cae2)
- Closing Settings no longer flashes the page black for a frame before the chat comes back (4817e25)

### Removed

- Built-in prompt templates and their localization entries (a5c9908, 2103f48)

## [1.1.3] - 2026-10-14

<!-- build 46 | since 1.1.2 (0e430ec) | 0e430ec..2317018 | 12 commits -->

### Changed

- Custom Headers support the `{session_id}` and `{model_id}` placeholders, with OpenCode and LiteLLM examples, and the per-conversation session header is sent as `x-opencode-session` (81360ea, c5ed87b)
- OpenCode presets are gone from the provider picker; those gateways are added by hand with their base URL (2e396ec)

### Fixed

- OpenCode gateways (Go and Zen) work end to end: each model is routed to the protocol it expects (e8fc1cc)
- Gemini providers pointed at a path that does not exist, so chat and model listing both failed; they now use Gemini's OpenAI-compatible surface, and providers you already saved correct themselves (6b19adb)
- Provider edits apply immediately: the request is rebuilt from the live provider before every send, regenerate, edit, and title (a3d5867)
- Jump-to-bottom stays available while generating, and no longer appears for short replies that already fit on screen (a884064, d900e5b)
- Pinned messages hold still when reasoning or tool cards expand and while the reply streams (7b62394)
- A card collapse tap no longer reads as dead while reasoning is painting (cbc5eaa)
- Removing a Custom Header row no longer crashes (c5ed87b)

## [1.1.2] - 2026-09-21

<!-- build 45 | since 1.1.1 (1d5ea7b) | 1d5ea7b..0e430ec | 25 commits -->

### New Features

- Full-resolution attachments: tapping a photo opens the original image, not just the compressed preview (4972510)

### Changed

- About lists Discord and X under Support, with wording aligned to the website (6970ab2)
- A What's New card appears once after each marketing-version upgrade (c0675f7, 5a43d94)
- The history drawer reopens near the conversation you just selected (44210d6)

### Fixed

- Failed requests show the server or gateway error instead of an empty bubble (7df4950)

## [1.1.1] - 2026-09-15

<!-- build 44 | since 1.0.9 (fb836f0) | fb836f0..1d5ea7b | 37 commits -->

### New Features

- Composer auto-grows with wrapped text, expands into a full-screen editor, and submits with the keyboard Send key (0e5af1a, 54a1fef, 66342cc)
- Copy control on expanded reasoning and tool cards; tool copy includes arguments and result (29a92c1)

### Added

- Just-captured photo shortcut at the top of the plus menu (1c7f39b)

### Changed

- The expanded editor sits flush above the keyboard, with no blank gap and no dark strip above the keyboard (0e8194d)
- Composer is one floating card without the soft-mask top lip (7464fdc)
- Transcript typography is lighter: headings and emphasis use softer font weights (413dd3d)

### Fixed

- The pinned bubble stays put when reasoning or tool cards expand and collapse, including after pin exhaustion (d2e9019)
- The pinned bubble stays put while the reply streams (7a8c1d7)
- Session titles no longer jank chat scrolling; short titles stay centered, long ones scroll horizontally, and full headline size is kept (57a60e4, 7a8c1d7)
- Fewer blank flashes when switching appearance or dismissing Settings (a7fbbfc)
- Photo-library picks appear in the composer immediately (48c2b9b)
- Empty-state preset clearance stays stable as the keyboard and composer grow (5b05c5b)
- The history drawer settings gear is nudged toward the trailing edge (a6d5e49)

## [1.0.9] - 2026-08-27

<!-- build 41 | since 1.0.8 (0a98ba4) | 0a98ba4..fb836f0 | 91 commits -->

### New Features

- Hamburger menu with a slide-out history drawer: open your chats with a single swipe from the left edge or the top-left icon; Settings moved into the drawer behind a dimmed backdrop (8b29ead, 2963b47, 5720db0, 8dac8e2)
- Long-press context menu on your own messages, with Edit, Copy, and Delete; delete confirms in a centered dialog
- Tool call cards show the size of the returned result next to the call duration, and show both the original and sent sizes when a result is trimmed
- Advanced reasoning options: XHigh and a free-text custom reasoning effort, and Off now correctly disables reasoning for each provider (fced6fe)

### Changed

- Tool Result Limit default raised to 20,000 characters, and Max Tokens default raised to 20,480 (f9effe1)
- Keyboard, composer, and page are lifted by a single animation block instead of a multi-phase state machine (b09eda5, 470fef8, 4812764, dcb6ac2)
- A fixed header replaces the native navigation bar, removing the iOS 17/18 title-bar flash (ecffd83)

### Fixed

- Third-party keyboards settle at the correct bottom position in one smooth motion on cold start, warm re-show, and first show (24463fd, 5e3a3ed, 019dc91)
- The sent bubble lands at the top of the chat in one paint instead of flashing at the bottom (69c48a7)
- Jump-to-bottom eases in smoothly: long jumps wait for off-screen tiles to rasterize first, and per-frame scroll reads are gone (8a55bd9)
- Copy feedback and message actions are restored after a stream finishes (2374f13, f894f71)

## [1.0.8] - 2026-08-16

<!-- build 35 | since 1.0.7 (cd8ac78) | cd8ac78..0a98ba4 | 52 commits -->

### New Features

- Chat themes: ready-made presets with live preview, your bubbles and the navigation bar following the same palette, and an accent toggle for the user bubble (d1ca481, 5226d84, 6fccbbb)
- Multi-select photos from the photo library in one picker flow (fc6ccf1)
- Backup & Restore: export a versioned JSON backup with per-category selection, and restore merges by upserting on id or name without deleting anything; API keys and custom headers are never exported (0f50c4d)

### Added

- Tool result truncation: oversized results are trimmed head and tail before being sent to the model, under a configurable character limit, while the stored message keeps the full result (9ac080a)
- Tool result size readout on tool cards, with Settings switches for truncation and for the readout
- MCP: the session id is echoed for stateful streamable HTTP servers (89db616), tool schemas are normalized so strict models accept them (d33cb51), and tool picker pages follow the chat theme (d74cace)

### Changed

- Keyboard push-up: the live tip is pushed above the keyboard with a sync-animated bottom pad that survives shrink and scroll (0ed2be9, 3082305)

### Fixed

- Replies no longer stutter as they settle: the history-drawer query is unmounted while closed and the idle drawer prewarm is gone (50e328f, cd485aa)
- Share sheets present from the key window on iOS 26+, so they appear over Settings immediately instead of after the page closes (ef45069)
- Starter cards lift above the keyboard on an empty new chat (01ef08d)
- Third-party keyboards push correctly on their first show (07f242e)

### Removed

- The cumulative `ctx N` footer chip was prototyped and dropped before release, because a request's `input_tokens` already equals the context-window usage at that point (9b4297f)

## [1.0.7] - 2026-08-06

### New Features

- The conversation you were in is restored after a cold start or process restart, and returning from a long background session shows fewer empty transcript screens (d746651)

### Changed

- Tool calls show arguments while they stream, arguments and results are pretty-printed as JSON, expanding cards no longer reflows width, and user and assistant footers share one action gap (b7fcd73, 6f79501)
- Settings runs in its own window so the chat WebView leaves the compositor during inertial scroll (1ba1756)
- Streaming reveal is block-stable: closed blocks are immutable, reasoning drains before the body advances, and an open code fence is highlighted once on commit (4f24c04, 4ef4b13, 6c424f7, 435fcd6)

### Fixed

- The pinned bubble holds its position while it streams and while reasoning or tool cards expand, without fighting a user pan (4668a86, 652b21e, 54de7f2, a13a2b1)
- At-bottom detection is restored with KVO on `contentOffset`, `contentSize`, and `bounds` after the preference-key path broke (b57b449)
- Jump-to-bottom works again on iPad: animated jumps use a JS smooth scroll, and a jump falls back to JS when the native content range looks viewport tall (11aae4e)
- Reasoning and tool icons render again on iOS 17 WKWebView, where luminance masks come out empty (68e382e)
- The typewriter no longer dumps its text on remount, and the mid-drag settle hitch, blank code fences, and headings reparsed mid-sentence are fixed (4ef4b13, 9afb048, 84791fc, f502124)
- Settings present and dismiss flashes and theme sync on dismiss on iOS 17/18 (7a2cc27, de576b3)
- The jump-to-bottom control no longer flashes white after status-bar layout jumps (c1f7266)

## [1.0.6] - 2026-07-17

### New Features

- Single-webview transcript: one view owns scrolling, Markdown, KaTeX, and highlight.js, which cuts scroll-time CPU and compositor churn
- Waterfall streaming engine: tokens are coalesced into a tail buffer and revealed sequentially, reasoning drains before the body advances, closed blocks are immutable, and only the trailing open fragment is repainted
- Prompt caching keeps more of the conversation reusable, so Time to First Token drops sharply after the first message of a session
- One unified Reasoning effort setting, shared by Settings and Chat Presets

### Changed

- Reasoning and tool sections are calmer: unified card chrome, duration badges, and collapse and expand that no longer move the text
- Export gains a footer brand, unified datetimes, and dark code-block styling
- iPhone is locked to portrait, and the iPad layout holds up after rotation

### Fixed

- Chat Preset selection and deselection, including restore when starting a new chat or switching sessions
- Non-standard `prompt_cache_key` and the `ContextManager` path are gone from request serialization (2738d61, f6b4d30)
