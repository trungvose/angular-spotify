import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IconModule } from '@angular-spotify/web/shared/ui/icon';
import { InputComponent } from './input.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IconModule],
  declarations: [InputComponent],
  exports: [InputComponent]
})
export class InputModule {}
