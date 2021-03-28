import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TracksComponent } from './tracks.component';
import { WorkInProgressModule } from '@angular-spotify/web/shared/ui/work-in-progress';

@NgModule({
  imports: [
    CommonModule,
    WorkInProgressModule,
    RouterModule.forChild([
      {
        path: '',
        component: TracksComponent
      }
    ])
  ],
  declarations: [TracksComponent],
  exports: [TracksComponent]
})
export class TracksModule {}
