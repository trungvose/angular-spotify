import { MediaCoverModule } from '@angular-spotify/web/shared/ui/media-cover';
import { PlayButtonModule } from '@angular-spotify/web/shared/ui/play-button';
import { SpinnerModule } from '@angular-spotify/web/shared/ui/spinner';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LetModule, PushModule } from '@ngrx/component';
import { NavBarPlaylistComponent } from './nav-bar-playlist.component';
import { NavLinkComponent } from './nav-link/nav-link.component';
@NgModule({
  imports: [CommonModule, RouterModule, PlayButtonModule, LetModule, PushModule, SpinnerModule, MediaCoverModule],
  declarations: [NavBarPlaylistComponent, NavLinkComponent],
  exports: [NavBarPlaylistComponent]
})
export class NavBarLinksModule {}
