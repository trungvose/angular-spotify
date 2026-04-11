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
import { Observable, ReplaySubject, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { shouldSkipInterceptor } from './skip-urls';

const MAX_REFRESH_ATTEMPTS = 2;

@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {
  private refreshInProgress$: Observable<string> | null = null;

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
        return throwError(error);
      })
    );
  }

  private handle401(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!this.refreshInProgress$) {
      const tokenSubject = new ReplaySubject<string>(1);
      // Capture the observable reference in a local variable before calling
      // subscribe, so it survives even if the subscribe callback fires
      // synchronously (e.g. in tests using `of(token)`) and clears
      // this.refreshInProgress$.
      const refresh$ = tokenSubject.asObservable();
      this.refreshInProgress$ = refresh$;

      // Execute the refresh and pipe results into the ReplaySubject. The reset
      // is scheduled as a microtask INSIDE the subscribe callbacks so it runs
      // only after the refresh has actually completed. A microtask (rather than
      // a direct assignment) ensures that any concurrent 401s that arrive in
      // the same synchronous batch still see a non-null refreshInProgress$ and
      // share this refresh, while a new 401 arriving in a later event-loop turn
      // correctly starts a fresh refresh.
      this.attemptRefreshToken(1).subscribe({
        next: (token) => {
          Promise.resolve().then(() => { this.refreshInProgress$ = null; });
          tokenSubject.next(token);
          tokenSubject.complete();
        },
        error: (err) => {
          Promise.resolve().then(() => { this.refreshInProgress$ = null; });
          tokenSubject.error(err);
        }
      });
    }

    return (this.refreshInProgress$ as Observable<string>).pipe(
      take(1),
      switchMap((newToken) => next.handle(this.addToken(req, newToken)))
    );
  }

  private attemptRefreshToken(attempt: number): Observable<string> {
    return this.authStore.tryRefreshToken().pipe(
      catchError((error) => {
        if (attempt < MAX_REFRESH_ATTEMPTS) {
          return this.attemptRefreshToken(attempt + 1);
        }
        this.uiStore.showUnauthorizedModal();
        return throwError(error);
      })
    );
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
