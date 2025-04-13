import { loadPlaylists } from '@angular-spotify/web/playlist/data-access';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { NavBarComponent } from '@angular-spotify/web/shell/ui/nav-bar';
import { TopBarComponent } from '@angular-spotify/web/shell/ui/top-bar';
import { VisualizerStore } from '@angular-spotify/web/visualizer/data-access';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { filter, map } from 'rxjs/operators';
import { MainViewComponent } from '../../../main-view/src/lib/main-view.component';
import { NowPlayingBarComponent } from '@angular-spotify/web/shell/ui/now-playing-bar';
import { AlbumArtOverlayComponent } from '../../../album-art-overlay/src/lib/album-art-overlay.component';
import { WebVisualizerUiComponent } from '@angular-spotify/web/visualizer/ui';
import { toSignal } from '@angular/core/rxjs-interop';
@Component({
  selector: 'as-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
      CommonModule,
      StoreModule,
      RouterModule,
      NavBarComponent,
      TopBarComponent,
      MainViewComponent,
      NowPlayingBarComponent,
      AlbumArtOverlayComponent,
      WebVisualizerUiComponent
    ],

})
export class LayoutComponent implements OnInit {
  showPiPVisualizer = toSignal(this.visualizerStore.showPiPVisualizer$, { initialValue: false });
  currentAlbumCoverUrl$ = this.playbackStore.currentTrack$.pipe(
    map((track) => track?.album?.images[0]?.url),
    filter((imageUrl) => !!imageUrl)
  );
  currentAlbumCoverUrl = toSignal(this.currentAlbumCoverUrl$, { initialValue: '' });

  constructor(
    private playbackStore: PlaybackStore,
    private store: Store,
    private visualizerStore: VisualizerStore
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadPlaylists());
  }
}
