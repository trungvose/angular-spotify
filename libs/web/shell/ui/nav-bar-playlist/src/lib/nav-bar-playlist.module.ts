import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarPlaylistComponent } from './nav-bar-playlist.component';
import { RouterModule } from '@angular/router';
import { NavPlaylistComponent } from './nav-playlist/nav-playlist.component';
import { PlayButtonModule } from '@angular-spotify/web/shared/ui/play-button';
import { LetModule, PushModule } from '@ngrx/component';
import { SpinnerModule } from '@angular-spotify/web/shared/ui/spinner';
@NgModule({
  imports: [CommonModule, RouterModule, PlayButtonModule, LetModule, PushModule, SpinnerModule],
  declarations: [NavBarPlaylistComponent, NavPlaylistComponent],
  exports: [NavBarPlaylistComponent]
})
export class NavBarPlaylistModule {}
