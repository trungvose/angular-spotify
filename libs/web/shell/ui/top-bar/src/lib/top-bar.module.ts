import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from './top-bar.component';
import { UserDropdownModule } from '@angular-spotify/web/shell/ui/user-dropdown';
import { SocialShareModule } from '@angular-spotify/web/shell/ui/social-share';
import { DataSizeObserverDirective } from '@angular-spotify/web/shared/directives/data-size-observer';
@NgModule({
  imports: [CommonModule, UserDropdownModule, SocialShareModule, DataSizeObserverDirective],
  declarations: [TopBarComponent],
  exports: [TopBarComponent]
})
export class TopBarModule {}
