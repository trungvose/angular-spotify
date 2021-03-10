import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumComponent } from './album.component';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [AlbumComponent],
  exports: [AlbumComponent]
})
export class AlbumModule {
  
}
