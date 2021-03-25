import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'as-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistComponent {}
