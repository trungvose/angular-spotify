# Playback Device Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 404 "No active device found" errors by passing `device_id` to the play endpoint and reconnecting the SDK player on authentication errors.

**Architecture:** Two independent fixes: (1) add `device_id` as a query parameter to `PUT /me/player/play`, sourced from `PlaybackStore.deviceId`; (2) add `player.disconnect()` + `player.connect()` in the `authentication_error` handler so the device re-registers via the existing `ready` listener.

**Tech Stack:** Angular, Spotify Web Playback SDK, Spotify Web API

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `libs/web/shared/data-access/models/src/lib/api/play-request.ts` | Modify | Add optional `device_id` to interface |
| `libs/web/shared/data-access/spotify-api/src/lib/player-api.ts` | Modify | Pass `device_id` as query param in `play()` |
| `libs/web/shared/data-access/store/src/lib/playback/playback.service.ts` | Modify | Reconnect on `authentication_error` |

---

## Task 1: Pass `device_id` to the play endpoint

**Files:**

- Modify: `libs/web/shared/data-access/models/src/lib/api/play-request.ts`
- Modify: `libs/web/shared/data-access/spotify-api/src/lib/player-api.ts`

### Step 1.1: Add `device_id` to the play request interface

- [ ] In `libs/web/shared/data-access/models/src/lib/api/play-request.ts`, add the field:

```typescript
export interface SpotifyPlayRequestApi {
  device_id?: string;
  context_uri?: string;
  uris?: string[];
  offset?: { position: number };
}
```

### Step 1.2: Pass `device_id` as query param in `PlayerApiService.play()`

- [ ] In `libs/web/shared/data-access/spotify-api/src/lib/player-api.ts`, update the `play()` method:

```typescript
play(request: SpotifyPlayRequestApi) {
  const { device_id, ...body } = request;
  const params = device_id ? { device_id } : {};
  return this.http.put(`${this.playerUrl}/play`, body, { params });
}
```

This destructures `device_id` out of the request body (Spotify expects it as a query param, not in the body) and passes the rest as the PUT body.

### Step 1.3: Build to verify no compile errors

- [ ] Run:

```bash
npx nx build angular-spotify --skip-nx-cache
```

Expected: Build succeeds.

### Step 1.4: Commit

- [ ] Run:

```bash
git add libs/web/shared/data-access/models/src/lib/api/play-request.ts libs/web/shared/data-access/spotify-api/src/lib/player-api.ts
git commit -m "fix(playback): pass device_id as query param to play endpoint"
```

---

## Task 2: Reconnect player on `authentication_error`

**Files:**

- Modify: `libs/web/shared/data-access/store/src/lib/playback/playback.service.ts`

### Step 2.1: Update the `authentication_error` handler

- [ ] In `libs/web/shared/data-access/store/src/lib/playback/playback.service.ts`, replace the `authentication_error` listener (lines 62-64):

Before:

```typescript
player.addListener('authentication_error', ({ message }) => {
  console.error(message);
});
```

After:

```typescript
player.addListener('authentication_error', ({ message }) => {
  console.error('[Angular Spotify] Authentication error, reconnecting...', message);
  player.disconnect();
  player.connect();
});
```

When `connect()` succeeds, the existing `ready` listener (lines 95-101) fires with a new `device_id`, stores it in `PlaybackStore`, and calls `transferUserPlayback(device_id)` — the device re-registers automatically.

### Step 2.2: Build to verify no compile errors

- [ ] Run:

```bash
npx nx build angular-spotify --skip-nx-cache
```

Expected: Build succeeds.

### Step 2.3: Commit

- [ ] Run:

```bash
git add libs/web/shared/data-access/store/src/lib/playback/playback.service.ts
git commit -m "fix(playback): reconnect SDK player on authentication_error"
```

---

## Task 3: Smoke test

### Step 3.1: Start dev server and verify playback works

- [ ] Run:

```bash
npx nx serve angular-spotify
```

- [ ] Log in, play a track — verify normal playback works
- [ ] Clear `access_token` from localStorage in DevTools to simulate token expiry
- [ ] Trigger a play action — verify the token refreshes, player reconnects, and playback resumes
- [ ] Check console for `[Angular Spotify] Authentication error, reconnecting...` followed by `[Angular Spotify] Ready with Device ID`
