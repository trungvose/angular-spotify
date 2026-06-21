import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { SvgIconComponent } from '@ngneat/svg-icon';
import { PinyinToggleComponent } from './pinyin-toggle.component';

@NgModule({
  imports: [CommonModule, NzToolTipModule, SvgIconComponent],
  declarations: [PinyinToggleComponent],
  exports: [PinyinToggleComponent]
})
export class PinyinToggleModule {}
