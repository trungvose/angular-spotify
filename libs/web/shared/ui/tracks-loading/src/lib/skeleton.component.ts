import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'as-skeleton',
  template: `<ng-content></ng-content>`,
  standalone: true
})
export class SkeletonComponent {
  @Input() pulse = true;
  @HostBinding('class') class = `bg-highlight text-transparent rounded-sm block`;
}
