import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from './top-bar.component';
import { UserDropdownModule } from '@angular-spotify/web/shell/ui/user-dropdown';

@NgModule({
  imports: [CommonModule, UserDropdownModule],
  declarations: [TopBarComponent],
  exports: [TopBarComponent]
})
export class TopBarModule {}
