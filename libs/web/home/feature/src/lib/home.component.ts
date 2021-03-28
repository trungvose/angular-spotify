import { loadFeaturedPlaylists, loadRecentTracks } from '@angular-spotify/web/home/data-access';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

@Component({
  selector: 'as-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(loadRecentTracks());
    this.store.dispatch(loadFeaturedPlaylists());
  }
}
