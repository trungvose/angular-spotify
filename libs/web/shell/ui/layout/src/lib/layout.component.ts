import { Store } from '@ngrx/store';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthStore } from '@angular-spotify/web/auth/data-access';
import { PlaybackService } from '@angular-spotify/web/shared/data-access/store';
import { loadPlaylists } from '@angular-spotify/web/playlist/data-access';

@Component({
  selector: 'as-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent implements OnInit {
  constructor(
    private authStore: AuthStore,
    private playbackService: PlaybackService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.authStore.init();
    this.playbackService.init();
    this.store.dispatch(loadPlaylists());
  }
}
