import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumArtOverlayComponent } from './album-art-overlay.component';

@NgModule({
  imports: [CommonModule],
  declarations: [AlbumArtOverlayComponent],
  exports: [AlbumArtOverlayComponent]
})
export class AlbumArtOverlayModule {}
