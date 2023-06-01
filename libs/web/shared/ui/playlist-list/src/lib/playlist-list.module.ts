import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistListComponent } from './playlist-list.component';
import { CardComponent } from '@angular-spotify/web/shared/ui/media';
import { SpinnerModule } from '@angular-spotify/web/shared/ui/spinner';

@NgModule({
  imports: [CommonModule, CardComponent, SpinnerModule],
  declarations: [PlaylistListComponent],
  exports: [PlaylistListComponent]
})
export class PlaylistListModule {}
