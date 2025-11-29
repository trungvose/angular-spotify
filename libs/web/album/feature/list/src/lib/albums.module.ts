import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumsComponent } from './albums.component';
import { RouterModule } from '@angular/router';
import { CardComponent } from '@angular-spotify/web/shared/ui/media';
import { SpinnerComponent } from '@angular-spotify/web/shared/ui/spinner';
@NgModule({
  imports: [
    CommonModule,
    CardComponent,
    SpinnerComponent,
    RouterModule.forChild([
      {
        path: '',
        component: AlbumsComponent
      }
    ])
  ],
  declarations: [AlbumsComponent]
})
export class AlbumsModule {}
