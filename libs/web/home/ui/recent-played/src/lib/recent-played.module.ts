import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecentPlayedComponent } from './recent-played.component';
import { CardComponent } from '@angular-spotify/web/shared/ui/media';
import { SpinnerModule } from '@angular-spotify/web/shared/ui/spinner';
@NgModule({
  imports: [CommonModule, CardComponent, SpinnerModule],
  declarations: [RecentPlayedComponent],
  exports: [RecentPlayedComponent]
})
export class RecentPlayedModule {}
