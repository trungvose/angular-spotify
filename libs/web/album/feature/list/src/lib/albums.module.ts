import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumsComponent } from './albums.component';
import { RouterModule } from '@angular/router';
import { MediaModule } from '@angular-spotify/web/shared/ui/media';
import { SpinnerModule } from '@angular-spotify/web/shared/ui/spinner';
@NgModule({
  imports: [
    CommonModule,
    MediaModule,
    SpinnerModule,
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
