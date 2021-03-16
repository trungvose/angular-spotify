import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'as-play-button',
  templateUrl: './play-button.component.html',
  styleUrls: ['./play-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayButtonComponent {
  @Input() isPause$!: Observable<boolean | undefined>;
  @Output() togglePlay = new EventEmitter<boolean>();
}
