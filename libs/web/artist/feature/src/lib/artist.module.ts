import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistComponent } from './artist.component';
import { WorkInProgressModule } from '@angular-spotify/web/shared/ui/work-in-progress';
import { RouterModule } from '@angular/router';
import { RouterUtil } from '@angular-spotify/web/shared/utils';

@NgModule({
  imports: [
    CommonModule,
    WorkInProgressModule,
    RouterModule.forChild([
      {
        path: `:${RouterUtil.Configuration.ArtistId}`,
        component: ArtistComponent
      }
    ])
  ],
  declarations: [ArtistComponent],
  exports: [ArtistComponent]
})
export class ArtistModule {}
