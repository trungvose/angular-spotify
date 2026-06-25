# CLAUDE.md

Guidance for working in this repo (Angular Spotify — an Nx monorepo Spotify clone).

## Verifying changes in the browser

Automated tests mock external services, so UI/playback changes must be verified in a real browser:

1. Start the dev server: `yarn start` (runs `nx serve`).
2. Open **http://127.0.0.1:4200/** — **not** `localhost`. Spotify's OAuth redirect/whitelist only accepts the `127.0.0.1` host, so `localhost:4200` will fail to authenticate.
3. Drive the browser with **Playwriter** (connects to your existing Chrome via the Playwriter extension), rather than launching a fresh headless browser — the app needs a logged-in Spotify session and the Web Playback SDK.

Note: features built on Chrome's built-in AI (e.g. pinyin lyrics) require a Chrome build with the built-in AI / Gemini Nano APIs enabled; they degrade silently elsewhere.
Guidance for AI agents and contributors working in this repository.

## Documentation

- **Always include a Mermaid diagram of how a feature works** when adding or
  changing a feature — show the data flow, the key components/stores involved,
  and the main user interactions. Put it in the PR description and/or the
  feature's design doc under `docs/`. Skip the diagram only for small bug fixes.
