import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClickStopPropagationDirective } from './click-stop-propagation.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [ClickStopPropagationDirective],
  exports: [ClickStopPropagationDirective]
})
export class ClickStopPropagationModule {}
