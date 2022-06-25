import { RouterUtil } from '@angular-spotify/web/shared/utils';
import { Routes } from '@angular/router';
import { ArtistComponent } from './artist.component';

export const ARTIST_ROUTES: Routes = [
  {
    path: `:${RouterUtil.Configuration.ArtistId}`,
    component: ArtistComponent
  }  
]


