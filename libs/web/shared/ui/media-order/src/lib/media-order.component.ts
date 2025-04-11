import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LetDirective } from '@ngrx/component';
import { PlayButtonComponent } from '@angular-spotify/web/shared/ui/play-button';
import { PushPipe } from '@ngrx/component';

@Component({
  selector: 'as-media-order',
  templateUrl: './media-order.component.html',
  styleUrls: ['./media-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LetDirective, PushPipe, PlayButtonComponent],
})
export class MediaOrderComponent {
  @Input() index!: number;
  @Input() isPlaying!: boolean | null;
  @Output() togglePlay = new EventEmitter<boolean>();
}
