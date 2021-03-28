import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDropdownStore } from './user-dropdown.store';

@Component({
  selector: 'as-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  styleUrls: ['./user-dropdown.component.scss'],
  providers: [UserDropdownStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDropdownComponent {
  userName$: Observable<string | undefined>;
  userAvatar$: Observable<string>;

  constructor(private store: UserDropdownStore) {
    this.userName$ = this.store.userName$;
    this.userAvatar$ = this.store.userAvatar$;
  }
}
