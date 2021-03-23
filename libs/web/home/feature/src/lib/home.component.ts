import { loadRecentTracks } from '@angular-spotify/web/home/data-access';
import { RootState } from '@angular-spotify/web/shared/data-access/store';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

@Component({
  selector: 'as-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

  constructor(private store: Store<RootState>) {}

  ngOnInit(): void {
    this.store.dispatch(loadRecentTracks());
  }
}
