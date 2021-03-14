import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'as-media-player',
  templateUrl: './media-player.component.html',
  styleUrls: ['./media-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaPlayerComponent {
}
