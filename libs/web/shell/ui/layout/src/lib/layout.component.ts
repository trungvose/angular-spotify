import { Store } from '@ngrx/store';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthStore } from '@angular-spotify/web/auth/data-access';
import { PlaybackService, PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { loadPlaylists } from '@angular-spotify/web/playlist/data-access';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'as-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent implements OnInit {
  currentAlbumCoverUrl$ = this.playbackStore.currentTrack$.pipe(
    map((track) => track?.album?.images[0]?.url),
    filter((imageUrl) => !!imageUrl)
  );
  
  constructor(
    private authStore: AuthStore,
    private playbackStore: PlaybackStore,
    private playbackService: PlaybackService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.authStore.init();
    this.playbackService.init();
    this.store.dispatch(loadPlaylists());
  }
}
