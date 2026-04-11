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
      store.tryRefreshToken().subscribe({
        error: (err) => {
          const message = err instanceof Error ? err.message : String(err);
          expect(message).toContain('No refresh token');
          done();
        }
      });
    });

    it('should propagate the error when the refresh API call fails', (done) => {
      LocalStorageService.setItem('refresh_token', 'existing-refresh-token');

      store.tryRefreshToken().subscribe({
        error: () => {
          done();
        }
      });

      const req = httpMock.expectOne((r) => r.url.includes('accounts.spotify.com/api/token'));
      req.flush({ error: 'invalid_grant' }, { status: 400, statusText: 'Bad Request' });
    });
  });
});
