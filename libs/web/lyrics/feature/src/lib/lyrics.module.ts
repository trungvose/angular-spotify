import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LyricsComponent } from './lyrics.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    LyricsComponent
  ],
  exports: [
    LyricsComponent
  ]
})
export class FeatureModule {}
