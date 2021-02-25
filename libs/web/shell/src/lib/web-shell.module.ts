import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { webShellRoutes } from './web-shell.routes';

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(webShellRoutes)],
  exports: [RouterModule],
  declarations: []
})
export class WebShellModule {}
