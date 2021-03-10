import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { webShellRoutes } from './web-shell.routes';
import { WebLayoutModule } from '@angular-spotify/web/layout';

@NgModule({
  imports: [
    CommonModule, 
    WebLayoutModule, 
    RouterModule.forRoot(webShellRoutes)
  ],
  exports: [RouterModule],
  declarations: []
})
export class WebShellModule {}
