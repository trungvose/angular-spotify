import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { WebShellModule } from '@angular-spotify/web/shell';
@NgModule({
  imports: [BrowserModule, WebShellModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
