import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnauthorizedModalComponent } from './unauthorized-modal.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';

@NgModule({
  imports: [CommonModule, NzModalModule, NzButtonModule],
  declarations: [UnauthorizedModalComponent],
  exports: [UnauthorizedModalComponent]
})
export class UnauthorizedModalModule {}
