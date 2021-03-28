import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDropdownComponent } from './user-dropdown.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';

@NgModule({
  imports: [CommonModule, NzDropDownModule],
  declarations: [UserDropdownComponent],
  exports: [UserDropdownComponent]
})
export class UserDropdownModule {}
