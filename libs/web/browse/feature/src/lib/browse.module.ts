import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowseComponent } from './browse.component';
import { WorkInProgressModule } from '@angular-spotify/web/shared/ui/work-in-progress';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    WorkInProgressModule,
    RouterModule.forChild([
      {
        path: '',
        component: BrowseComponent
      }
    ])
  ],
  declarations: [BrowseComponent],
  exports: [BrowseComponent]
})
export class BrowseModule {}
