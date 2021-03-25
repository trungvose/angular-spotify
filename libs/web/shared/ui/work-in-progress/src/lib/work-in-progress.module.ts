import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkInProgressComponent } from './work-in-progress.component';

@NgModule({
  imports: [CommonModule],
  declarations: [WorkInProgressComponent],
  exports: [WorkInProgressComponent]
})
export class WorkInProgressModule {}
