import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'as-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumComponent {}
