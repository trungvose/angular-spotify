import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'as-album-cover',
  template: '',
  styleUrls: ['./album-cover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumCoverComponent {
  @Input() imageUrl: string | undefined;

  @HostBinding('style.background-image')
  get backgroundUrl() {
    return `url(${this.imageUrl})`;
  }
}
