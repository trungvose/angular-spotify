import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { InputComponent } from '@angular-spotify/web/shared/ui/input';
import { SpinnerComponent } from '@angular-spotify/web/shared/ui/spinner';
import { CardComponent } from '@angular-spotify/web/shared/ui/media';
import { MediaTableModule } from '@angular-spotify/web/shared/ui/media-table';
import { AlbumTrackComponent } from '@angular-spotify/web/album/ui/album-track';
import { SearchComponent } from './search.component';
import { SvgIconComponent } from '@ngneat/svg-icon';

@NgModule({
  imports: [
    CommonModule,
    InputComponent,
    SpinnerComponent,
    CardComponent,
    MediaTableModule,
    SvgIconComponent,
    AlbumTrackComponent,
    RouterModule.forChild([
      {
        path: '',
        component: SearchComponent
      }
    ])
  ],
  declarations: [SearchComponent],
  exports: [SearchComponent]
})
export class SearchModule {}
