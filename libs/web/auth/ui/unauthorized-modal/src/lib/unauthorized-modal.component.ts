import { AuthStore } from '@angular-spotify/web/auth/data-access';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  templateUrl: './unauthorized-modal.component.html',
  styleUrls: ['./unauthorized-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnauthorizedModalComponent {
  confirmModal?: NzModalRef;

  constructor(private modal: NzModalRef, private store: AuthStore) {}

  authenticate() {
    this.store.redirectToAuthorize();
    this.modal.destroy();
  }
}
