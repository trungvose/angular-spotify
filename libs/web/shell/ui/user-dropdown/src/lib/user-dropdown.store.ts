import { AuthStore } from '@angular-spotify/web/auth/data-access';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class UserDropdownStore {
  userName$: Observable<string | undefined>;
  userAvatar$: Observable<string>;

  constructor(private store: AuthStore) {
    this.userName$ = this.store.userName$;
    this.userAvatar$ = this.store.userAvatar$;
  }
}
