import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { RootState } from '@angular-spotify/web/shared/data-access/store';
import { loadRecentTracks, getRecentPlayedTracks } from '@angular-spotify/web/home/data-access';
import { Observable } from 'rxjs';

@Component({
  selector: 'as-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  recentTracks$!: Observable<SpotifyApi.PlayHistoryObject[] | undefined>;

  constructor(private store: Store<RootState>) {}

  ngOnInit(): void {
    this.store.dispatch(loadRecentTracks());
    this.recentTracks$ = this.store.pipe(select(getRecentPlayedTracks));
  }
}
