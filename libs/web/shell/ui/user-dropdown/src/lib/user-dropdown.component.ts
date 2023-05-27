import { AuthStore } from '@angular-spotify/web/auth/data-access';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'as-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  styleUrls: ['./user-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDropdownComponent {
  userName$ = this.store.userName$;
  userAvatar$ = this.store.userAvatar$;
  userProduct$ = this.store.userProduct$;

  constructor(private store: AuthStore) { }
}
