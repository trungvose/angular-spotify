import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ArtistStore } from '@angular-spotify/web/artist/data-access';
import { ArtistTopTracksModule } from '@angular-spotify/web/artist/ui/artist-top-tracks';
import { MediaSummaryModule } from '@angular-spotify/web/shared/ui/media-summary';
import { TracksLoadingModule } from '@angular-spotify/web/shared/ui/tracks-loading';
import { WorkInProgressModule } from '@angular-spotify/web/shared/ui/work-in-progress';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'as-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ArtistStore],
  standalone: true,
  imports: [
    CommonModule,
    WorkInProgressModule,
    MediaSummaryModule,
    TracksLoadingModule,
    ArtistTopTracksModule
  ]
})
export class ArtistComponent {
  artist$ = this.artistStore.artist$;
  isArtistLoading$ = this.artistStore.isArtistLoading$;

  constructor(private artistStore: ArtistStore) {}
}