import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { VisualizationToggleComponent } from './visualization-toggle.component';
import { FormsModule } from '@angular/forms';
import { ReactiveComponentModule } from '@ngrx/component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { SvgIconsModule } from '@ngneat/svg-icon';
@NgModule({
  imports: [
    CommonModule,
    NzSwitchModule,
    NzToolTipModule,
    FormsModule,
    ReactiveComponentModule,
    SvgIconsModule
  ],
  declarations: [VisualizationToggleComponent],
  exports: [VisualizationToggleComponent]
})
export class VisualizationToggleModule {}
