import { Injectable, Provider } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthStore } from '@angular-spotify/web/auth/data-access';
import { switchMap, take } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authStore: AuthStore) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const excludedUrls = ['https://accounts.spotify.com/api/token'];

    // Verificar si la URL de la solicitud está en la lista de exclusión
    if (excludedUrls.includes(req.url)) {
      return next.handle(req); // No añadir Authorization header
    }

    return this.authStore.token$.pipe(
      take(1),
      switchMap((token) => {
        if (!token) {
          return next.handle(req);
        }
        const headers = req.headers.set('Authorization', `Bearer ${token}`);
        const authReq = req.clone({
          headers
        });
        return next.handle(authReq);
      })
    );
  }
}

export const authInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
};
