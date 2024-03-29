import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './nav-bar.component';
import { RouterModule } from '@angular/router';
import { NavLinksModule } from '@angular-spotify/web/shell/ui/nav-links';
import { SvgIconComponent } from '@ngneat/svg-icon';
@NgModule({
  imports: [CommonModule, NavLinksModule, RouterModule, SvgIconComponent],
  declarations: [NavBarComponent],
  exports: [NavBarComponent]
})
export class NavBarModule {}
