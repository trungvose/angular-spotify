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
  @Input() set roundedImage(isRounded: boolean | undefined) {
    this.borderRadius = isRounded ? '50%' : 'initial';
  }

  @HostBinding('style.background-image') backgroundUrl!: string | undefined;
  @HostBinding('style.border-radius') borderRadius!: string | undefined;
}
