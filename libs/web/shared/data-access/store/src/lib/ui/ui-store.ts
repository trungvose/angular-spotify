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
        { label: 'Search', path: '/visualizer' },
        { label: 'Your Library', path: '/collection/playlists' }
      ]
    });
  }

  readonly navItems$ = this.select(({ navItems }) => navItems);
}
