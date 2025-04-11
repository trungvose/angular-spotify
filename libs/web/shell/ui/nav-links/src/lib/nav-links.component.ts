import { getPlaylists, getPlaylistsLoading } from '@angular-spotify/web/playlist/data-access';
import { PlayButtonModule } from '@angular-spotify/web/shared/ui/play-button';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { select, Store } from '@ngrx/store';
@Component({
  selector: 'as-nav-links',
  templateUrl: './nav-links.component.html',
  styleUrls: ['./nav-links.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    PlayButtonModule,
    LetDirective,
    PushPipe,
    SpinnerModule,
    MediaCoverModule
  ],
})
export class NavLinksComponent {
  playlists$ = this.store.pipe(select(getPlaylists));
  isPlaylistsLoading$ = this.store.pipe(select(getPlaylistsLoading));

  constructor(private store: Store) {}
}
