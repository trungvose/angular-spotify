import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'as-album-summary',
  templateUrl: './album-summary.component.html',
  styleUrls: ['./album-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumSummaryComponent {
  @Input() type: 'Album' | 'Playlist' | undefined;
  @Input() title: string | undefined;
  @Input() description!: string | null;
  @Input() artist: string | undefined;
  @Input() trackCount: number | undefined;
  @Input() imageUrl: string | undefined;

}
