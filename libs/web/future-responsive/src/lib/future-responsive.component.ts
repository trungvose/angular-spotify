import { Component } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ResponsiveToContainerComponent } from './responsive-container.component';
import { ResponsiveToContentComponent } from './content/responsive-content.component';

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
      <as-responsive-to-content class="block mb-20"></as-responsive-to-content>
      <as-responsive-to-container></as-responsive-to-container>
    </div>
  `
})
export class FutureResponsiveComponent {
}
