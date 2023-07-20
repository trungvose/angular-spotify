import { Directive, ElementRef, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[dataSizeObserver]'
})
export class DataSizeObserverDirective implements OnInit, OnDestroy {
  @HostBinding('class') dataSizeObserverClass = 'data-size-observer';
  @Input() @HostBinding('class.bottom') bottom = false;
  @Input() @HostBinding('class.top') top = false;

  constructor(private elementRef: ElementRef) {}
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width } = entry.contentRect;
      this.elementRef.nativeElement.setAttribute('data-size', `${Number(width.toFixed(2))}px`);
    }
  });

  ngOnInit(): void {
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver.unobserve(this.elementRef.nativeElement);
  }
}
