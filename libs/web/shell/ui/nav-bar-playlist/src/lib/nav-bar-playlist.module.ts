import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarPlaylistComponent } from './nav-bar-playlist.component';
import { RouterModule } from '@angular/router';
import { NavPlaylistComponent } from './nav-playlist/nav-playlist.component';
import { PlayButtonModule } from '@angular-spotify/web/shared/ui/play-button';
import { ReactiveComponentModule } from '@ngrx/component';
import { SvgIconsModule } from '@ngneat/svg-icon';
@NgModule({
  imports: [CommonModule, RouterModule, PlayButtonModule, ReactiveComponentModule, SvgIconsModule],
  declarations: [NavBarPlaylistComponent, NavPlaylistComponent],
  exports: [NavBarPlaylistComponent]
})
export class NavBarPlaylistModule {}
