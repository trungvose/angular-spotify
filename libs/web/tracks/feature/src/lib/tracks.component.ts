import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TracksStore } from '@angular-spotify/web/tracks/data-access';
@Component({
  selector: 'as-tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TracksStore]
})
export class TracksComponent implements OnInit {
  vm$ = this.store.vm$;

  constructor(private store: TracksStore) {}

  ngOnInit() {
    this.store.loadTracks();
  }

  playTrack(track: SpotifyApi.TrackObjectFull) {
    this.store.playTrack({ track });
  }
}
