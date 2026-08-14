# Playback Device Recovery — Design Spec

## Problem

When the Spotify access token expires mid-session:

1. The Web Playback SDK player loses its device registration with Spotify
2. API calls to `/me/player/play` return 404 "No active device found" because the endpoint relies on Spotify knowing the active device, and no `device_id` is passed
3. The `authentication_error` listener only logs the error — no reconnection happens

## Solution

Two changes:

### 1. Pass `device_id` as query parameter on play requests

Per [spotify/web-api#1325](https://github.com/spotify/web-api/issues/1325), passing `device_id` as a query param to `/me/player/play?device_id=xxx` avoids the 404 — Spotify targets the device directly instead of looking for an "active" device.

- Add optional `device_id` field to `SpotifyPlayRequestApi` interface
- `PlayerApiService.play()` passes `device_id` as a query param when provided
- Backward-compatible: callers that don't pass `device_id` work as before

### 2. Reconnect player on `authentication_error`

The `getOAuthToken` callback already reads fresh tokens from localStorage (previous fix). The SDK retries `getOAuthToken` internally before firing `authentication_error`. If the error still fires, it means the player's WebSocket connection is severed and the device is deregistered.

On `authentication_error`:
1. Log the error (existing behavior)
2. Call `player.disconnect()`
3. Call `player.connect()` — this triggers `getOAuthToken` again with the fresh token

The existing `ready` listener handles the rest: stores the new `device_id` and calls `transferUserPlayback(device_id)` to re-register the device.

## Files Modified

1. `libs/web/shared/data-access/models/src/lib/api/play-request.ts` — add optional `device_id` to interface
2. `libs/web/shared/data-access/spotify-api/src/lib/player-api.ts` — pass `device_id` as query param in `play()`
3. `libs/web/shared/data-access/store/src/lib/playback/playback.service.ts` — add `disconnect()`/`connect()` in `authentication_error` handler

## What Doesn't Change

- `PlaybackStore` — already stores `deviceId` from the `ready` event
- `ready` listener — already calls `transferUserPlayback(device_id)`
- `getOAuthToken` callback — already reads fresh tokens from localStorage (previous PR fix)
- All other player API methods (`pause`, `next`, `prev`, `seek`, `setVolume`) — unaffected
