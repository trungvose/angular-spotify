import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'as-media-order',
  templateUrl: './media-order.component.html',
  styleUrls: ['./media-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaOrderComponent {
  @Input() index!: number;
  @Input() isPlaying!: boolean | null;
  @Output() togglePlay = new EventEmitter<boolean>();
}
