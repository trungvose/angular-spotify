import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout.component';
import { RouterModule } from '@angular/router';
import { NavBarModule } from '@angular-spotify/web/shared/ui/nav-bar';
import { TopBarModule } from '@angular-spotify/web/shared/ui/top-bar';

@NgModule({
  imports: [CommonModule, RouterModule, NavBarModule, TopBarModule],
  declarations: [LayoutComponent],
  exports: [LayoutComponent]
})
export class WebLayoutModule {}
