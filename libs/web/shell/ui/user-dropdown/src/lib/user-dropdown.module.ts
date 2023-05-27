import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDropdownComponent } from './user-dropdown.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { RouterModule } from '@angular/router';
@NgModule({
  imports: [CommonModule, NzDropDownModule, SvgIconsModule, RouterModule],
  declarations: [UserDropdownComponent],
  exports: [UserDropdownComponent]
})
export class UserDropdownModule {}
