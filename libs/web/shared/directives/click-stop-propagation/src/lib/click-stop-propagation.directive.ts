import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[asClickStopPropagation]'
})
export class ClickStopPropagationDirective {
  @HostListener('click', ['$event']) onClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }
}
