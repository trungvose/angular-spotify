import { Injectable } from '@angular/core';
import { NavItem } from '@angular-spotify/web/shared/data-access/models';
import { ComponentStore } from '@ngrx/component-store';
import { filter, switchMapTo, tap } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UnauthorizedModalComponent } from '@angular-spotify/web/auth/ui/unauthorized-modal';

interface UIState {
  navItems: NavItem[];
  isShowUnauthorizedModal: boolean;
}

@Injectable({ providedIn: 'root' })
export class UIStore extends ComponentStore<UIState> {
  constructor(private modalService: NzModalService) {
    super({
      navItems: [
        { label: 'Home', path: '', exact: true },
        { label: 'Search', path: '/search' },
        { label: 'Browse', path: '/browse' },
        { label: 'My Playlists', path: '/collection/playlists' },
        { label: 'My Albums', path: '/albums' }
      ],
      isShowUnauthorizedModal: false
    });
  }
  readonly isShowUnauthorizedModal$ = this.select((s) => s.isShowUnauthorizedModal);
  readonly navItems$ = this.select(({ navItems }) => navItems);

  readonly showUnauthorizedModal = this.effect((params$) =>
    params$.pipe(
      switchMapTo(this.isShowUnauthorizedModal$),
      filter((s) => !s),
      tap(() => {
        this.patchState({
          isShowUnauthorizedModal: true
        });
        this.modalService.create({
          nzTitle: 'Your access token has expired!',
          nzContent: UnauthorizedModalComponent,
          nzClosable: false,
          nzKeyboard: false,
          nzMaskClosable: false
        });
      })
    )
  );
}
