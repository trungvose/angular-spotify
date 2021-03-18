import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaCoverModule } from '@angular-spotify/web/shared/ui/media-cover';
import { MediaComponent } from './media.component';
import { PlayButtonModule } from '@angular-spotify/web/shared/ui/play-button';
import { ReactiveComponentModule } from '@ngrx/component';
import { ClickStopPropagationModule } from '@angular-spotify/web/shared/directives/click-stop-propagation';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveComponentModule,
    MediaCoverModule,
    PlayButtonModule,
    ClickStopPropagationModule
  ],
  declarations: [MediaComponent],
  exports: [MediaComponent]
})
export class MediaModule {}
