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

  it('should succeed on second refresh attempt', (done) => {
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
        expect(refreshCallCount).toBe(1);
        done();
      }
    };

    http.get('/api/endpoint-a').subscribe({ next: onComplete });
    http.get('/api/endpoint-b').subscribe({ next: onComplete });

    const requests = httpMock.match((r) => r.url.startsWith('/api/endpoint-'));
    expect(requests.length).toBe(2);
    requests[0].flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    requests[1].flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

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
