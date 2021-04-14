import { Injectable } from '@angular/core';
import { NavItem } from '@angular-spotify/web/shared/data-access/models';
import { filter, switchMapTo, tap } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UnauthorizedModalComponent } from '@angular-spotify/web/auth/ui/unauthorized-modal';
import { FeatureStore } from 'mini-rx-store';

interface UIState {
  navItems: NavItem[];
  isShowUnauthorizedModal: boolean;
}

@Injectable({ providedIn: 'root' })
export class UIStore extends FeatureStore<UIState> {
  constructor(private modalService: NzModalService) {
    super('ui', {
      navItems: [
        { label: 'Home', path: '', exact: true },
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
        this.setState({
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
