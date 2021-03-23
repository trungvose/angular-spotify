import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarPlaylistComponent } from './nav-bar-playlist.component';
import { RouterModule } from '@angular/router';
import { NavPlaylistComponent } from './nav-playlist/nav-playlist.component';
import { PlayButtonModule } from '@angular-spotify/web/shared/ui/play-button';
import { ReactiveComponentModule } from '@ngrx/component';
@NgModule({
  imports: [CommonModule, RouterModule, PlayButtonModule, ReactiveComponentModule],
  declarations: [NavBarPlaylistComponent, NavPlaylistComponent],
  exports: [NavBarPlaylistComponent]
})
export class NavBarPlaylistModule {}
