import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '@ngneat/svg-icon';

@Component({
  selector: 'as-play-button',
  templateUrl: './play-button.component.html',
  styleUrls: ['./play-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SvgIconComponent]
})
export class PlayButtonComponent {
  isPause: boolean | undefined;
  @Input() isPlaying: boolean | null | undefined;
  @Input() primary = false;
  @Input() large = false;
  @Input() flatIcon = false;
  @HostBinding('class.is-show-volume') @Input() isShowVolumeIcon = false;
  @Output() togglePlay = new EventEmitter<boolean>();

  get buttonClass() {
    if (this.flatIcon) {
      return ['flex'];
    }
    const baseClass = 'flex play-button control-button';
    const sizeClass = this.large ? 'large' : '';
    return [baseClass, sizeClass, this.primary ? 'text-white bg-primary' : 'text-black bg-white'];
  }

  get svgSize() {
    return this.large ? 'lg' : 'md';
  }
}
