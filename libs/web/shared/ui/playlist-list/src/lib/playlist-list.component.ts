import { CurrentViewTransitionService, getViewTransitionParamValue } from '@angular-spotify/shared/view-transition';
import { PlaylistsResponseWithRoute } from '@angular-spotify/web/shared/data-access/models';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { RouterUtil } from '@angular-spotify/web/shared/utils';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';

@Component({
  selector: 'as-playlist-list',
  templateUrl: './playlist-list.component.html',
  styleUrls: ['./playlist-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistListComponent {
  @Input() playlists!: PlaylistsResponseWithRoute | null;
  @Input() isLoading!: boolean | null;
  transitionService = inject(CurrentViewTransitionService);

  constructor(private playerApi: PlayerApiService) {}

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
    viewTransitionName(item: SpotifyApi.PlaylistObjectSimplified) {
      const transition = this.transitionService.currentTransition();
      const transitionAlbumId = getViewTransitionParamValue(
        transition,
        RouterUtil.Configuration.PlaylistId
      );
      const withViewTransition = transitionAlbumId === item.id;
      return withViewTransition ? 'with-view-transition' : '';
    }
}
