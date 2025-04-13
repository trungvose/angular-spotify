import { getPlaylists, getPlaylistsLoading } from '@angular-spotify/web/playlist/data-access';
import { PlayButtonComponent } from '@angular-spotify/web/shared/ui/play-button';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LetDirective, PushPipe } from '@ngrx/component';
import { select, Store } from '@ngrx/store';
import { SpinnerComponent } from '@angular-spotify/web/shared/ui/spinner';
import { MediaCoverComponent } from '@angular-spotify/web/shared/ui/media-cover';
import { NavLinkComponent } from "./nav-link/nav-link.component";
@Component({
  selector: 'as-nav-links',
  templateUrl: './nav-links.component.html',
  styleUrls: ['./nav-links.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    PlayButtonComponent,
    LetDirective,
    PushPipe,
    SpinnerComponent,
    MediaCoverComponent,
    NavLinkComponent
],
})
export class NavLinksComponent {
  playlists$ = this.store.pipe(select(getPlaylists));
  isPlaylistsLoading$ = this.store.pipe(select(getPlaylistsLoading));

  constructor(private store: Store) {}
}
