# Token Refresh on 401 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Silently refresh the Spotify access token on 401 responses (up to 2 attempts) before showing the token expired modal.

**Architecture:** The `UnauthorizedInterceptor` becomes the retry engine. It calls a new public `tryRefreshToken()` on `AuthStore`, retries once on failure, and replays the original request with the fresh token. A `BehaviorSubject` prevents concurrent refresh races. The modal is the last resort after 2 failed refreshes.

**Tech Stack:** Angular HttpInterceptor, RxJS (BehaviorSubject, switchMap, retry, catchError, filter, take), NgRx ComponentStore, Jest

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `libs/web/auth/data-access/src/lib/store/auth.store.ts` | Modify | Add public `tryRefreshToken()` method |
| `libs/web/auth/data-access/src/lib/store/auth.store.spec.ts` | Create | Tests for `tryRefreshToken()` |
| `libs/web/auth/util/src/lib/interceptors/unauthorized.interceptor.ts` | Modify | Refresh + retry + replay logic |
| `libs/web/auth/util/src/lib/interceptors/unauthorized.interceptor.spec.ts` | Create | Tests for interceptor retry flow |

---

## Task 1: Add `tryRefreshToken()` to AuthStore

**Files:**

- Modify: `libs/web/auth/data-access/src/lib/store/auth.store.ts`
- Create: `libs/web/auth/data-access/src/lib/store/auth.store.spec.ts`

### Step 1.1: Write the failing test for `tryRefreshToken()` success path

- [ ] Create the test file:

```typescript
// libs/web/auth/data-access/src/lib/store/auth.store.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { AuthStore, SpotifyTokenResponse } from './auth.store';
import { SpotifyApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { LocalStorageService } from '@angular-spotify/web/settings/data-access';

describe('AuthStore', () => {
  let store: AuthStore;
  let httpMock: HttpTestingController;

  const mockTokenResponse: SpotifyTokenResponse = {
    access_token: 'new-access-token',
    expires_in: 3600,
    refresh_token: 'new-refresh-token',
    scope: 'user-read-private',
    token_type: 'Bearer'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        AuthStore,
        provideMockStore(),
        { provide: SpotifyApiService, useValue: {} }
      ]
    });

    store = TestBed.inject(AuthStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('tryRefreshToken', () => {
    it('should refresh the token and return the new access token', (done) => {
      LocalStorageService.setItem('refresh_token', 'existing-refresh-token');

      store.tryRefreshToken().subscribe((newToken) => {
        expect(newToken).toBe('new-access-token');
        done();
      });

      const req = httpMock.expectOne((r) => r.url.includes('accounts.spotify.com/api/token'));
      expect(req.request.body).toContain('grant_type=refresh_token');
      expect(req.request.body).toContain('refresh_token=existing-refresh-token');
      req.flush(mockTokenResponse);
    });

    it('should save new tokens to localStorage on success', (done) => {
      LocalStorageService.setItem('refresh_token', 'existing-refresh-token');

      store.tryRefreshToken().subscribe(() => {
        expect(LocalStorageService.getItem('access_token')).toBe('new-access-token');
        expect(LocalStorageService.getItem('token_type')).toBe('Bearer');
        expect(LocalStorageService.getItem('refresh_token')).toBe('new-refresh-token');
        expect(LocalStorageService.getItem('expires_at')).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne((r) => r.url.includes('accounts.spotify.com/api/token'));
      req.flush(mockTokenResponse);
    });

    it('should update the component store state on success', (done) => {
      LocalStorageService.setItem('refresh_token', 'existing-refresh-token');

      store.tryRefreshToken().subscribe(() => {
        expect(store.getToken()).toBe('new-access-token');
        done();
      });

      const req = httpMock.expectOne((r) => r.url.includes('accounts.spotify.com/api/token'));
      req.flush(mockTokenResponse);
    });

    it('should throw when no refresh token exists in localStorage', (done) => {
      // No refresh token set in localStorage
      store.tryRefreshToken().subscribe({
        error: (err) => {
          expect(err.message).toContain('No refresh token');
          done();
        }
      });
    });

    it('should propagate the error when the refresh API call fails', (done) => {
      LocalStorageService.setItem('refresh_token', 'existing-refresh-token');

      store.tryRefreshToken().subscribe({
        error: () => {
          // Error propagated, not swallowed
          done();
        }
      });

      const req = httpMock.expectOne((r) => r.url.includes('accounts.spotify.com/api/token'));
      req.flush({ error: 'invalid_grant' }, { status: 400, statusText: 'Bad Request' });
    });
  });
});
```

### Step 1.2: Run the test to verify it fails

- [ ] Run:

```bash
npx nx test web-auth-data-access --testPathPattern=auth.store.spec --no-cache
```

Expected: FAIL — `tryRefreshToken` is not a function (method doesn't exist yet).

### Step 1.3: Implement `tryRefreshToken()` on AuthStore

- [ ] In `libs/web/auth/data-access/src/lib/store/auth.store.ts`, add `map` to the imports:

```typescript
import { catchError, filter, map, switchMap, switchMapTo, tap } from 'rxjs/operators';
```

Then add this public method to the `AuthStore` class (after the `redirectToAuthorize()` method, around line 83):

```typescript
tryRefreshToken(): Observable<string> {
  const refreshToken = LocalStorageService.getItem(LOCALSTORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken) {
    return throwError(() => new Error('No refresh token available'));
  }

  return this.refreshAccessToken(refreshToken).pipe(
    tap((tokenResponse) => {
      const newExpiresAt = Date.now() + tokenResponse.expires_in * 1000;
      this.saveTokensToStorage(tokenResponse, newExpiresAt);
      this.updateStateWithTokens(tokenResponse, newExpiresAt);
    }),
    map((tokenResponse) => tokenResponse.access_token)
  );
}
```

### Step 1.4: Run the tests to verify they pass

- [ ] Run:

```bash
npx nx test web-auth-data-access --testPathPattern=auth.store.spec --no-cache
```

Expected: All 5 tests PASS.

### Step 1.5: Commit

- [ ] Run:

```bash
git add libs/web/auth/data-access/src/lib/store/auth.store.ts libs/web/auth/data-access/src/lib/store/auth.store.spec.ts
git commit -m "feat(auth): add tryRefreshToken() to AuthStore for interceptor use"
```

---

## Task 2: Rewrite UnauthorizedInterceptor with refresh + retry + replay

**Files:**

- Modify: `libs/web/auth/util/src/lib/interceptors/unauthorized.interceptor.ts`
- Create: `libs/web/auth/util/src/lib/interceptors/unauthorized.interceptor.spec.ts`

### Step 2.1: Write the failing tests for the interceptor

- [ ] Create the test file:

```typescript
// libs/web/auth/util/src/lib/interceptors/unauthorized.interceptor.spec.ts
import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UnauthorizedInterceptor } from './unauthorized.interceptor';
import { AuthStore } from '@angular-spotify/web/auth/data-access';
import { UIStore } from '@angular-spotify/web/shared/data-access/store';
import { of, throwError } from 'rxjs';

describe('UnauthorizedInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authStoreMock: { tryRefreshToken: jest.Mock };
  let uiStoreMock: { showUnauthorizedModal: jest.Mock };

  beforeEach(() => {
    authStoreMock = {
      tryRefreshToken: jest.fn()
    };
    uiStoreMock = {
      showUnauthorizedModal: jest.fn()
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: UnauthorizedInterceptor,
          multi: true,
          deps: [AuthStore, UIStore]
        },
        { provide: AuthStore, useValue: authStoreMock },
        { provide: UIStore, useValue: uiStoreMock }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should pass through successful responses', (done) => {
    http.get('/api/test').subscribe((data) => {
      expect(data).toEqual({ ok: true });
      done();
    });

    httpMock.expectOne('/api/test').flush({ ok: true });
  });

  it('should pass through non-401 errors', (done) => {
    http.get('/api/test').subscribe({
      error: (err: HttpErrorResponse) => {
        expect(err.status).toBe(500);
        expect(uiStoreMock.showUnauthorizedModal).not.toHaveBeenCalled();
        done();
      }
    });

    httpMock.expectOne('/api/test').flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should skip interceptor for token endpoint URLs', (done) => {
    http.get('https://accounts.spotify.com/api/token').subscribe((data) => {
      expect(data).toEqual({ token: 'abc' });
      done();
    });

    httpMock.expectOne('https://accounts.spotify.com/api/token').flush({ token: 'abc' });
  });

  it('should refresh token and replay request on 401', (done) => {
    authStoreMock.tryRefreshToken.mockReturnValue(of('fresh-token'));

    http.get('/api/test').subscribe((data) => {
      expect(data).toEqual({ result: 'success' });
      expect(authStoreMock.tryRefreshToken).toHaveBeenCalledTimes(1);
      done();
    });

    // First request returns 401
    httpMock.expectOne('/api/test').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Replayed request with new token succeeds
    const retried = httpMock.expectOne('/api/test');
    expect(retried.request.headers.get('Authorization')).toBe('Bearer fresh-token');
    retried.flush({ result: 'success' });
  });

  it('should retry refresh once then show modal after 2 failures', (done) => {
    authStoreMock.tryRefreshToken
      .mockReturnValueOnce(throwError(() => new Error('refresh failed')))
      .mockReturnValueOnce(throwError(() => new Error('refresh failed again')));

    http.get('/api/test').subscribe({
      next: () => fail('should not succeed'),
      error: () => {
        expect(authStoreMock.tryRefreshToken).toHaveBeenCalledTimes(2);
        expect(uiStoreMock.showUnauthorizedModal).toHaveBeenCalledTimes(1);
        done();
      }
    });

    httpMock.expectOne('/api/test').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('should show modal and succeed on second refresh attempt', (done) => {
    authStoreMock.tryRefreshToken
      .mockReturnValueOnce(throwError(() => new Error('refresh failed')))
      .mockReturnValueOnce(of('fresh-token-attempt-2'));

    http.get('/api/test').subscribe((data) => {
      expect(data).toEqual({ result: 'retry-success' });
      expect(authStoreMock.tryRefreshToken).toHaveBeenCalledTimes(2);
      expect(uiStoreMock.showUnauthorizedModal).not.toHaveBeenCalled();
      done();
    });

    // First request returns 401
    httpMock.expectOne('/api/test').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Second refresh attempt succeeds, replayed request succeeds
    const retried = httpMock.expectOne('/api/test');
    expect(retried.request.headers.get('Authorization')).toBe('Bearer fresh-token-attempt-2');
    retried.flush({ result: 'retry-success' });
  });

  it('should not trigger multiple refreshes for concurrent 401s', (done) => {
    let refreshCallCount = 0;
    authStoreMock.tryRefreshToken.mockImplementation(() => {
      refreshCallCount++;
      return of('shared-fresh-token');
    });

    let completed = 0;
    const onComplete = () => {
      completed++;
      if (completed === 2) {
        // Only one refresh should have been triggered
        expect(refreshCallCount).toBe(1);
        done();
      }
    };

    // Fire two requests concurrently
    http.get('/api/endpoint-a').subscribe({ next: onComplete });
    http.get('/api/endpoint-b').subscribe({ next: onComplete });

    // Both return 401
    const requests = httpMock.match((r) => r.url.startsWith('/api/endpoint-'));
    expect(requests.length).toBe(2);
    requests[0].flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    requests[1].flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Both get replayed with the same fresh token
    const retries = httpMock.match((r) => r.url.startsWith('/api/endpoint-'));
    expect(retries.length).toBe(2);
    retries.forEach((r) => {
      expect(r.request.headers.get('Authorization')).toBe('Bearer shared-fresh-token');
      r.flush({ ok: true });
    });
  });

  it('should error concurrent waiters when refresh fails', (done) => {
    authStoreMock.tryRefreshToken.mockReturnValue(
      throwError(() => new Error('refresh failed'))
    );

    let errorCount = 0;
    const onError = () => {
      errorCount++;
      if (errorCount === 2) {
        expect(uiStoreMock.showUnauthorizedModal).toHaveBeenCalledTimes(1);
        done();
      }
    };

    http.get('/api/endpoint-a').subscribe({ error: onError });
    http.get('/api/endpoint-b').subscribe({ error: onError });

    const requests = httpMock.match((r) => r.url.startsWith('/api/endpoint-'));
    requests[0].flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    requests[1].flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });
});
```

### Step 2.2: Run the tests to verify they fail

- [ ] Run:

```bash
npx nx test web-auth-util --testPathPattern=unauthorized.interceptor.spec --no-cache
```

Expected: FAIL — the interceptor doesn't have refresh/retry logic yet.

### Step 2.3: Implement the new UnauthorizedInterceptor

- [ ] Replace the contents of `libs/web/auth/util/src/lib/interceptors/unauthorized.interceptor.ts` with:

```typescript
import { UIStore } from '@angular-spotify/web/shared/data-access/store';
import { AuthStore } from '@angular-spotify/web/auth/data-access';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Injectable, Provider } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { shouldSkipInterceptor } from './skip-urls';

const MAX_REFRESH_ATTEMPTS = 2;

@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshResult$ = new Subject<string>();

  constructor(
    private authStore: AuthStore,
    private uiStore: UIStore
  ) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (shouldSkipInterceptor(req.url)) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (this.isRefreshing) {
      return this.waitForRefreshAndRetry(req, next);
    }

    this.isRefreshing = true;
    this.refreshResult$ = new Subject<string>();

    return this.attemptRefresh(req, next, 1);
  }

  private attemptRefresh(
    req: HttpRequest<unknown>,
    next: HttpHandler,
    attempt: number
  ): Observable<HttpEvent<unknown>> {
    return this.authStore.tryRefreshToken().pipe(
      switchMap((newToken) => {
        this.completeRefresh(newToken);
        return next.handle(this.addToken(req, newToken));
      }),
      catchError((error) => {
        if (attempt < MAX_REFRESH_ATTEMPTS) {
          return this.attemptRefresh(req, next, attempt + 1);
        }
        this.failRefresh(error);
        this.uiStore.showUnauthorizedModal();
        return throwError(() => error);
      })
    );
  }

  private waitForRefreshAndRetry(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return this.refreshResult$.pipe(
      take(1),
      switchMap((token) => next.handle(this.addToken(req, token)))
    );
  }

  private completeRefresh(token: string): void {
    this.isRefreshing = false;
    this.refreshResult$.next(token);
    this.refreshResult$.complete();
  }

  private failRefresh(error: unknown): void {
    this.isRefreshing = false;
    this.refreshResult$.error(error);
  }

  private addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }
}

export const unauthorizedInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: UnauthorizedInterceptor,
  multi: true,
  deps: [AuthStore, UIStore]
};
```

### Step 2.4: Run the tests to verify they pass

- [ ] Run:

```bash
npx nx test web-auth-util --testPathPattern=unauthorized.interceptor.spec --no-cache
```

Expected: All 8 tests PASS.

### Step 2.5: Run the AuthStore tests too to check nothing broke

- [ ] Run:

```bash
npx nx test web-auth-data-access --testPathPattern=auth.store.spec --no-cache
```

Expected: All 5 tests PASS.

### Step 2.6: Commit

- [ ] Run:

```bash
git add libs/web/auth/util/src/lib/interceptors/unauthorized.interceptor.ts libs/web/auth/util/src/lib/interceptors/unauthorized.interceptor.spec.ts
git commit -m "feat(auth): add token refresh retry with replay on 401 responses"
```

---

## Task 3: Smoke test the full flow

### Step 3.1: Build the app to catch any compile errors

- [ ] Run:

```bash
npx nx build angular-spotify --skip-nx-cache
```

Expected: Build succeeds with no errors.

### Step 3.2: Run both test suites together

- [ ] Run:

```bash
npx nx test web-auth-data-access --no-cache && npx nx test web-auth-util --no-cache
```

Expected: All tests pass.

### Step 3.3: Manual smoke test

- [ ] Start the dev server:

```bash
npx nx serve angular-spotify
```

- [ ] Open the app in the browser, log in with Spotify
- [ ] Wait for the token to expire (or manually clear `access_token` from localStorage to simulate a 401)
- [ ] Verify the app silently refreshes the token and continues working
- [ ] Verify the modal only appears if refresh fails (e.g., clear both `access_token` and `refresh_token`)

### Step 3.4: Final commit (if any adjustments needed)

- [ ] If smoke testing required tweaks, commit them:

```bash
git add -u
git commit -m "fix(auth): adjustments from smoke testing token refresh"
```
