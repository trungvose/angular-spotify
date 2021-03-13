import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumCoverComponent } from './album-cover.component';

@NgModule({
  imports: [CommonModule],
  declarations: [AlbumCoverComponent],
  exports: [AlbumCoverComponent]
})
export class AlbumCoverModule {}
