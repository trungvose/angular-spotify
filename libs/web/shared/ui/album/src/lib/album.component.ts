import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'as-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumComponent {
  @Input() imageUrl = '';
  @Input() title = '';
  @Input() description: string | null = '';
  @Input() routerUrl = '';

  get backgroundUrl(){
    return `url(${this.imageUrl})`
  }
}
