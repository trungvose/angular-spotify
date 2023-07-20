import { Directive, HostBinding } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[resizable]'
})
export class ResizableDirective {
  @HostBinding('class') className = 'overflow-auto resize-x';
}
