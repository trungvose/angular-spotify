import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout.component';
import { RouterModule } from '@angular/router';
import { NavBarModule } from '@angular-spotify/web/shared/ui/nav-bar';
@NgModule({
  imports: [CommonModule, RouterModule, NavBarModule],
  declarations: [LayoutComponent],
  exports: [LayoutComponent]
})
export class WebLayoutModule {}
