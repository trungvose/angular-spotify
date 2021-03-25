import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TracksLoadingComponent } from './tracks-loading.component';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';

@NgModule({
  imports: [CommonModule, NzSkeletonModule],
  declarations: [TracksLoadingComponent],
  exports: [TracksLoadingComponent]
})
export class TracksLoadingModule {}
