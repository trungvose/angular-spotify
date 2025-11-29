import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayButtonComponent } from '@angular-spotify/web/shared/ui/play-button';

@Component({
  selector: 'as-media-order',
  templateUrl: './media-order.component.html',
  styleUrls: ['./media-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PlayButtonComponent],
})
export class MediaOrderComponent {
  @Input() index!: number;
  @Input() isPlaying!: boolean | null;
  @Output() togglePlay = new EventEmitter<boolean>();
}
