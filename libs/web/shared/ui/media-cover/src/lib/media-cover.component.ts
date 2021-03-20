import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'as-media-cover',
  template: '',
  styleUrls: ['./media-cover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaCoverComponent {
  @Input() imageUrl: string | undefined;

  @HostBinding('style.background-image')
  get backgroundUrl() {
    return `url(${this.imageUrl})`;
  }
}
