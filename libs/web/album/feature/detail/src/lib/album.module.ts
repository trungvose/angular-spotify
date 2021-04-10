import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumComponent } from './album.component';
import { WorkInProgressModule } from '@angular-spotify/web/shared/ui/work-in-progress';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    WorkInProgressModule,
    RouterModule.forChild([
      {
        path: '',
        component: AlbumComponent
      }
    ])
  ],
  declarations: [AlbumComponent]
})
export class AlbumModule {}
