import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaTableHeaderComponent } from './media-table-header/media-table-header.component';
import { MediaTableRowComponent } from './media-table-row/media-table-row.component';

@NgModule({
  imports: [CommonModule],
  declarations: [MediaTableHeaderComponent, MediaTableRowComponent],
  exports: [MediaTableHeaderComponent, MediaTableRowComponent]
})
export class MediaTableModule {}
