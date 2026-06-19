import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { TracksStore } from '@angular-spotify/web/tracks/data-access';
import { SavedTracksStore } from '@angular-spotify/web/shared/data-access/store';

@Component({
  selector: 'as-tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TracksStore]
})
export class TracksComponent implements OnInit {
  vm$ = this.store.vm$;

  displayedTracks$ = combineLatest([
    this.store.vm$,
    this.savedTracksStore.savedMap$
  ]).pipe(
    map(([vm, savedMap]) =>
      (vm.data ?? []).filter(
        (item) => item.track && savedMap[item.track.id] !== false
      )
    )
  );

  constructor(
    private store: TracksStore,
    private savedTracksStore: SavedTracksStore,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit() {
    this.store.loadTracks();
    this.store.vm$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vm) => {
        const ids = (vm.data ?? [])
          .map((item) => item.track?.id)
          .filter((id): id is string => !!id);
        if (ids.length) {
          this.savedTracksStore.markSaved(ids);
        }
      });
  }

  playTrack(track: SpotifyApi.TrackObjectFull) {
    this.store.playTrack({ track });
  }

  loadMore() {
    this.store.loadMore();
  }
}
