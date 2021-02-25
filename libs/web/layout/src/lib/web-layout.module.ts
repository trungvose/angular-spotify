import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout.component';
import { LeftNavComponent } from './left-nav/left-nav.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [LayoutComponent, LeftNavComponent],
  exports: [LayoutComponent]
})
export class WebLayoutModule {}
