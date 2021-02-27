import { Injectable } from '@angular/core';
import { NavItem } from '@angular-spotify/web/shared/data-access/models';
import { ComponentStore } from '@ngrx/component-store';

interface UIState {
  navItems: NavItem[];
}

@Injectable({ providedIn: 'root' })
export class UIStore extends ComponentStore<UIState> {
  constructor() {
    super({
      navItems: [
        { label: 'Home', path: '' },
        { label: 'Search', path: '/search' },
        { label: 'Your Library', path: '/collection' }
      ]
    });
  }

  readonly navItems$ = this.select(({ navItems }) => navItems);
}
