import { AuthStore } from '@angular-spotify/web/auth/data-access';
import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';

@Injectable()
export class UserDropdownStore extends ComponentStore<Record<string, string>> {
  userName$: Observable<string | undefined>;
  userAvatar$: Observable<string>;
  userProduct$: Observable<string>;

  constructor(private store: AuthStore) {
    super({});
    this.userName$ = this.store.userName$;
    this.userAvatar$ = this.store.userAvatar$;
    this.userProduct$ = this.store.userProduct$;
  }
}
