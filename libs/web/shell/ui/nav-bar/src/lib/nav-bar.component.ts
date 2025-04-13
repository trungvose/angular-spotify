import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UIStore } from '@angular-spotify/web/shared/data-access/store';
import { NavLinksComponent } from '@angular-spotify/web/shell/ui/nav-links';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from '@ngneat/svg-icon';
import { CommonModule } from '@angular/common';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'as-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, NavLinksComponent, RouterModule, SvgIconComponent],
  providers: [
    NzModalService
  ]
})
export class NavBarComponent {
  readonly navItems$ = this.uiStore.navItems$;

  constructor(private readonly uiStore: UIStore) {}
}
