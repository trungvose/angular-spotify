import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecentPlayedComponent } from './recent-played.component';
import { MediaModule } from '@angular-spotify/web/shared/ui/media';
import { SvgIconsModule } from '@ngneat/svg-icon';
@NgModule({
  imports: [CommonModule, MediaModule, SvgIconsModule],
  declarations: [RecentPlayedComponent],
  exports: [RecentPlayedComponent]
})
export class RecentPlayedModule {}
