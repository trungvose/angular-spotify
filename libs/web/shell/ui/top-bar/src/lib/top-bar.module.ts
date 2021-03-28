import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from './top-bar.component';
import { UserDropdownModule } from '@angular-spotify/web/shell/ui/user-dropdown';
import { SocialShareModule } from '@angular-spotify/web/shell/ui/social-share';
@NgModule({
  imports: [CommonModule, UserDropdownModule, SocialShareModule],
  declarations: [TopBarComponent],
  exports: [TopBarComponent]
})
export class TopBarModule {}
