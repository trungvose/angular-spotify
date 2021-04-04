import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from './spinner.component';
import {SvgIconsModule} from '@ngneat/svg-icon';

@NgModule({
  imports: [CommonModule, SvgIconsModule],
  declarations: [SpinnerComponent],
  exports: [SpinnerComponent]
})
export class SpinnerModule {}
