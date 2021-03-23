import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { WebShellModule } from '@angular-spotify/web/shell/feature';
import { getAppConfigProvider } from '@angular-spotify/web/shared/app-config';
import { authInterceptorProvider } from '@angular-spotify/web/auth/util';
import { environment } from '../environments/environment';
import { HttpClientModule } from '@angular/common/http';
@NgModule({
  imports: [BrowserModule, HttpClientModule, WebShellModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [getAppConfigProvider(environment), authInterceptorProvider]
})
export class AppModule {}
