import { AuthService } from '@angular-spotify/web/auth/data-access';
import { loadPlaylists, RootState } from '@angular-spotify/web/shared/data-access/store';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
@Component({
  selector: 'as-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent implements OnInit {
  constructor(private authService: AuthService, private store: Store<RootState>) {}

  ngOnInit(): void {
    this.store.dispatch(loadPlaylists());
  }
}
