import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UIStore } from '@angular-spotify/web/shared/data-access/store';

@Component({
  selector: 'as-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarComponent {
  readonly navItems$ = this.uiStore.navItems$;

  constructor(private readonly uiStore: UIStore) {}
}
