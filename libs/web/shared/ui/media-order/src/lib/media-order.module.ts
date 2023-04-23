import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaOrderComponent } from './media-order.component';
import { LetModule, PushModule } from '@ngrx/component';
import { PlayButtonModule } from '@angular-spotify/web/shared/ui/play-button';

@NgModule({
  imports: [CommonModule, LetModule, PushModule, PlayButtonModule],
  declarations: [MediaOrderComponent],
  exports: [MediaOrderComponent]
})
export class MediaOrderModule {}
