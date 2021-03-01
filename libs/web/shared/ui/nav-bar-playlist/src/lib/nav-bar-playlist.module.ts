import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarPlaylistComponent } from './nav-bar-playlist.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [NavBarPlaylistComponent],
  exports: [NavBarPlaylistComponent]
})
export class NavBarPlaylistModule {}
