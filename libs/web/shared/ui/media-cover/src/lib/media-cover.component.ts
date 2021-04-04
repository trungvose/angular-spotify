import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'as-media-cover',
  template: '',
  styleUrls: ['./media-cover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaCoverComponent {
  @Input() set imageUrl(url: string | undefined) {
    this.backgroundUrl = url && `url(${url})`;
  }

  @HostBinding('style.background-image') backgroundUrl!: string | undefined;
}
