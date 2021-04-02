import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UserDropdownStore } from './user-dropdown.store';

@Component({
  selector: 'as-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  styleUrls: ['./user-dropdown.component.scss'],
  providers: [UserDropdownStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDropdownComponent {
  userName$ = this.store.userName$;
  userAvatar$ = this.store.userAvatar$;

  constructor(private store: UserDropdownStore) {}
}
