# Token Refresh on 401 — Design Spec

## Problem

When the Spotify access token expires mid-session, the `UnauthorizedInterceptor` immediately shows a "token expired" modal forcing the user to re-login. The codebase already has a working `refreshAccessToken()` method in `AuthStore`, but it's only used on app startup. We should attempt a silent token refresh (up to 2 times) before showing the modal.

## Solution

Retry logic in the `UnauthorizedInterceptor`. On a 401, attempt to refresh the token and replay the original request. Only show the modal after 2 failed refresh attempts.

## Files Modified

1. **`libs/web/auth/data-access/src/lib/store/auth.store.ts`** — add public `tryRefreshToken()` method
2. **`libs/web/auth/util/src/lib/interceptors/unauthorized.interceptor.ts`** — rewrite with refresh + retry + replay logic

## Design

### AuthStore: `tryRefreshToken()`

A new public method that:
1. Reads `refresh_token` from localStorage
2. Calls the existing private `refreshAccessToken(refreshToken)`
3. On success: saves tokens to localStorage via `saveTokensToStorage()`, updates component store state via `updateStateWithTokens()`, and returns the new `access_token` string
4. On failure: throws the error (does NOT clear tokens or redirect — that's the interceptor's job now)

This keeps all token persistence logic centralized in AuthStore.

### UnauthorizedInterceptor: Refresh + Retry + Replay

```
Request -> API -> 401 response
  |
  +-- Is a refresh already in progress? (check BehaviorSubject)
  |    +-- YES -> wait for it to complete, get new token, replay request
  |    +-- NO  -> set "refreshing = true", attempt 1:
  |              |
  |              +-- authStore.tryRefreshToken() succeeds
  |              |    -> set "refreshing = false", emit new token via Subject
  |              |    -> replay original request with new Bearer token
  |              |
  |              +-- fails -> attempt 2:
  |                   +-- succeeds -> same as above
  |                   +-- fails -> set "refreshing = false"
  |                        -> uiStore.showUnauthorizedModal()
  |                        -> return error
```

**Concurrency handling:** A `BehaviorSubject<string | null>` acts as a lock. When a refresh is in progress (`isRefreshing = true`), concurrent 401 responses skip the refresh and instead wait on the subject. Once the refresh completes, the subject emits the new token and all waiters replay their requests with it.

**Retry mechanism:** Uses RxJS `retry(1)` on the `tryRefreshToken()` call for a maximum of 2 total attempts. No manual retry counting needed.

**Request replay:** The original `HttpRequest` is cloned with the new `Authorization: Bearer <newToken>` header and passed to `next.handle()` — same pattern as `AuthInterceptor`.

**Dependencies injected:** `AuthStore` (new) and `UIStore` (existing).

### Edge Case: Replayed Request Returns 401

If the refresh succeeds but the replayed request still returns 401 (e.g., token was revoked server-side between refresh and replay), the interceptor does NOT retry again. The replayed request's 401 propagates as a normal error — the interceptor only catches the *first* 401 per request. This prevents infinite retry loops.

### What Doesn't Change

- **AuthInterceptor** — still injects Bearer token on outbound requests
- **UIStore.showUnauthorizedModal()** — still the last resort, just called less often
- **UnauthorizedModalComponent** — same UI, same "Login" button
- **skip-urls.ts** — refresh endpoint (`accounts.spotify.com/api/token`) already skipped, so the refresh call won't intercept itself
- **App init flow** — `handleExistingTokens()` still does proactive refresh on startup
