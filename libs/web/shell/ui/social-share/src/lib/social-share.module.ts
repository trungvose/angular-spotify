import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialShareComponent } from './social-share.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { SvgIconComponent } from '@ngneat/svg-icon';

@NgModule({
  imports: [CommonModule, SvgIconComponent, NzButtonModule],
  declarations: [SocialShareComponent],
  exports: [SocialShareComponent]
})
export class SocialShareModule {}
