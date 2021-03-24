import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecentPlayedComponent } from './recent-played.component';
import { MediaModule } from '@angular-spotify/web/shared/ui/media';

@NgModule({
  imports: [CommonModule, MediaModule],
  declarations: [RecentPlayedComponent],
  exports: [RecentPlayedComponent]
})
export class RecentPlayedModule {}
