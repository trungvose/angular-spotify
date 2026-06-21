import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { PinyinToggleComponent } from './pinyin-toggle.component';

@NgModule({
  imports: [CommonModule, NzToolTipModule],
  declarations: [PinyinToggleComponent],
  exports: [PinyinToggleComponent]
})
export class PinyinToggleModule {}
