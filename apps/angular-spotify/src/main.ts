import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import * as Sentry from '@sentry/angular';
import { Integrations } from '@sentry/tracing';

if (environment.production) {
  enableProdMode();
}

Sentry.init({
  dsn: 'https://678ecbef83174cfb881d81a1e74aa0ff@o495789.ingest.sentry.io/5691023',
  integrations: [
    new Integrations.BrowserTracing({
      tracingOrigins: ['https://spotify.trungk18.com/'],
      routingInstrumentation: Sentry.routingInstrumentation
    })
  ],
  tracesSampleRate: 1.0
});

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
