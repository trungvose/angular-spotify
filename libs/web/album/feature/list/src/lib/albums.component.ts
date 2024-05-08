import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { getAlbums, getAlbumsLoading, loadAlbums } from '@angular-spotify/web/album/data-access';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { RouterUtil } from '@angular-spotify/web/shared/utils';
import {
  CurrentViewTransitionService,
  getViewTransitionParamValue
} from '@angular-spotify/shared/view-transition';

@Component({
  selector: 'as-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumsComponent implements OnInit {
  albums$ = this.store.pipe(select(getAlbums));
  isLoading$ = this.store.pipe(select(getAlbumsLoading));
  transitionService = inject(CurrentViewTransitionService);

  constructor(private store: Store, private playerApi: PlayerApiService) {}

  ngOnInit(): void {
    this.store.dispatch(loadAlbums());
  }

  togglePlay(isPlaying: boolean, contextUri: string) {
    this.playerApi
      .togglePlay(isPlaying, {
        context_uri: contextUri
      })
      .subscribe();
  }

  /*
    When transitioning to or from the detail page, include the `with-view-transition` transition name.
    This enables the browser to animate between the cover photo image in the list and its image on the detail page.
  */
  viewTransitionName(item: SpotifyApi.SavedAlbumObject) {
    const transition = this.transitionService.currentTransition();
    const transitionAlbumId = getViewTransitionParamValue(
      transition,
      RouterUtil.Configuration.AlbumId
    );
    const withViewTransition = transitionAlbumId === item.album.id;
    return withViewTransition ? 'with-view-transition' : '';
  }
}
