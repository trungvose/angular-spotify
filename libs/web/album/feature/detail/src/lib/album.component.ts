import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlbumStore } from '@angular-spotify/web/album/data-access';
import { AlbumTrackComponent } from '@angular-spotify/web/album/ui/album-track';
import { MediaSummaryModule } from '@angular-spotify/web/shared/ui/media-summary';
import { MediaTableModule } from '@angular-spotify/web/shared/ui/media-table';
import { PlayButtonModule } from '@angular-spotify/web/shared/ui/play-button';
import { TracksLoadingModule } from '@angular-spotify/web/shared/ui/tracks-loading';
import { CommonModule } from '@angular/common';
import { SvgIconsModule } from '@ngneat/svg-icon';

@Component({
  selector: 'as-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss'],
  providers: [AlbumStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    TracksLoadingModule,
    MediaSummaryModule,
    PlayButtonModule,
    MediaTableModule,
    SvgIconsModule,
    AlbumTrackComponent
  ]
})
export class AlbumComponent {
  album$ = this.store.album$;
  isAlbumLoading$ = this.store.isCurrentAlbumLoading$;
  isAlbumPlaying$ = this.store.isAlbumPlaying$;

  constructor(private store: AlbumStore) {}

  toggleAlbum(isPlaying: boolean, uri: string) {
    this.store.toggleAlbum({
      isPlaying,
      uri
    });
  }
}
