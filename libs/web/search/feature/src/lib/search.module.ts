import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { InputModule } from '@angular-spotify/web/shared/ui/input';
import { SpinnerModule } from '@angular-spotify/web/shared/ui/spinner';
import { MediaModule } from '@angular-spotify/web/shared/ui/media';
import { MediaTableModule } from '@angular-spotify/web/shared/ui/media-table';
import { AlbumTrackModule } from '@angular-spotify/web/album/ui/album-track';
import { SearchComponent } from './search.component';
import { SvgIconsModule } from '@ngneat/svg-icon';

@NgModule({
  imports: [
    CommonModule,
    InputModule,
    SpinnerModule,
    MediaModule,
    MediaTableModule,
    SvgIconsModule,
    AlbumTrackModule,
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
