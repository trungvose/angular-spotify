import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'as-skeleton',
  template: `<ng-content></ng-content>`,
  standalone: true
})
export class SkeletonComponent {
  @HostBinding('class') class = 'bg-highlight animate-pulse text-transparent rounded-sm block';
}
