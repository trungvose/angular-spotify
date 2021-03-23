import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './nav-bar.component';
import { RouterModule } from '@angular/router';
import { NavBarPlaylistModule } from '@angular-spotify/web/shell/ui/nav-bar-playlist';
@NgModule({
  imports: [CommonModule, RouterModule, NavBarPlaylistModule],
  declarations: [NavBarComponent],
  exports: [NavBarComponent]
})
export class NavBarModule {}
