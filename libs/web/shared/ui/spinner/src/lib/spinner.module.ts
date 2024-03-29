import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from './spinner.component';
import {SvgIconComponent} from '@ngneat/svg-icon';

@NgModule({
  imports: [CommonModule, SvgIconComponent],
  declarations: [SpinnerComponent],
  exports: [SpinnerComponent]
})
export class SpinnerModule {}
