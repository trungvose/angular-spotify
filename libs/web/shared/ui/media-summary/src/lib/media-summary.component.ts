import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'as-media-summary',
  templateUrl: './media-summary.component.html',
  styleUrls: ['./media-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaSummaryComponent {
  @Input() type: 'Album' | 'Playlist' | 'Artist' | undefined;
  @Input() title: string | undefined;
  @Input() description!: string | null;
  @Input() artist: string | undefined;
  @Input() trackCount: number | undefined;
  @Input() likesCount: number | undefined;
  @Input() followerCount: number | undefined;
  @Input() imageUrl: string | undefined;
  @Input() releaseDate: string | undefined;

  likeMapping: {[k: string]: string} = {'=1': '# like', 'other': '# likes'};
  songMapping: {[k: string]: string} = {'=1': '# song', 'other': '# songs'};
  followerMapping: {[k: string]: string} = {'=1': '# follower', 'other': '# followers'};
}
