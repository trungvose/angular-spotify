import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumComponent } from './album.component';
import { AlbumCoverModule } from '@angular-spotify/web/shared/ui/album-cover';
@NgModule({
  imports: [CommonModule, AlbumCoverModule, RouterModule],
  declarations: [AlbumComponent],
  exports: [AlbumComponent]
})
export class AlbumModule {}
