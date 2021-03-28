import { UIStore } from '@angular-spotify/web/shared/data-access/store';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Provider } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class UnauthorizedInterceptor implements HttpInterceptor {
  constructor(private uiStore: UIStore) {}

  intercept(
    req: HttpRequest<Record<string, string>>,
    next: HttpHandler
  ): Observable<HttpEvent<Record<string, string>>> {
    return next.handle(req).pipe(
      catchError((err: HttpResponse<Record<string, string>>) => {
        if (err.status === 401) {
          this.uiStore.showUnauthorizedModal();
        }
        return of(err);
      })
    );
  }
}

export const unauthorizedInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: UnauthorizedInterceptor,
  multi: true,
  deps: [UIStore]
};
