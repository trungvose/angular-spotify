import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { webShellRoutes } from './web-shell.routes';
import { WebLayoutModule } from '@angular-spotify/web/layout';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { rootReducers, rootEffects } from '@angular-spotify/web/shared/data-access/store';
@NgModule({
  imports: [
    CommonModule,
    WebLayoutModule,
    RouterModule.forRoot(webShellRoutes),
    StoreModule.forRoot(rootReducers),
    EffectsModule.forRoot(rootEffects)
  ],
  exports: [RouterModule],
  declarations: []
})
export class WebShellModule {}
