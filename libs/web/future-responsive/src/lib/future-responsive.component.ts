import { Component } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ResponsiveToContentComponent } from './content/responsive-content.component';
import { ResponsiveToContainerComponent } from './responsive-container.component';

@Component({
  selector: 'as-future-responsive',
  standalone: true,
  imports: [
    NzButtonModule,
    ResponsiveToContentComponent,
    ResponsiveToContainerComponent
  ],
  template: `
    <div class="content-spacing pb-[250px]">
      <h1 class="text-3xl text-white">Hello London 🏴󠁧󠁢󠁥󠁮󠁧󠁿</h1>
      <div class="flex pb-6">
        <a
          nz-button
          class="text-xl text-primary btn-with-icon"
          target="_blank"
          href="https://trungvose.com/talks/2024-01-29-ndc-london/"
          >👉 View my slide</a
        >
      </div>
      <as-responsive-to-content class="block mb-20"></as-responsive-to-content>
      <as-responsive-to-container></as-responsive-to-container>
    </div>
  `
})
export class FutureResponsiveComponent {}
