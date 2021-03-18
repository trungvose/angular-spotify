import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output
} from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'as-play-button',
  templateUrl: './play-button.component.html',
  styleUrls: ['./play-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayButtonComponent {
  @Input() isPause$!: Observable<boolean | undefined>;
  @Input() primary = false;
  @Input() large = false;
  @Input() flatIcon = false;
  @HostBinding('class.is-show-volume') @Input() isShowVolumeIcon = false;
  @Output() togglePlay = new EventEmitter<boolean>();

  get buttonClass() {
    if (this.flatIcon) {
      return [''];
    }
    const baseClass = 'play-icon control-button';
    const sizeClass = this.large ? 'large' : '';
    return [baseClass, sizeClass, this.primary ? 'text-white bg-primary' : 'text-black bg-white'];
  }

  get svgSize() {
    return this.large ? 'lg' : 'md';
  }
}
