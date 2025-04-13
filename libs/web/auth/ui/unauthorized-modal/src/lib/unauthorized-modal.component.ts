import { AuthStore } from '@angular-spotify/web/auth/data-access';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  templateUrl: './unauthorized-modal.component.html',
  styleUrls: ['./unauthorized-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzModalModule, NzButtonModule],

})
export class UnauthorizedModalComponent {
  confirmModal?: NzModalRef;

  constructor(private modal: NzModalRef, private store: AuthStore) {}

  authenticate() {
    this.store.redirectToAuthorize();
    this.modal.destroy();
  }
}
