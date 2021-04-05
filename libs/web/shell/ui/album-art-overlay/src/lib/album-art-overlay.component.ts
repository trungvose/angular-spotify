import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'as-album-art-overlay',
  templateUrl: './album-art-overlay.component.html',
  styleUrls: ['./album-art-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AlbumArtOverlayComponent implements AfterViewInit {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  context!: CanvasRenderingContext2D | null;

  constructor(private playbackStore: PlaybackStore) {}

  ngAfterViewInit() {
    this.context = this.canvas.nativeElement.getContext('2d');
    if (this.context) {
      this.context.filter = 'blur(15px)';
    }
    this.playbackStore.currentTrack$
      .pipe(
        map((track) => track?.album?.images[0]?.url),
        filter((imageUrl) => !!imageUrl)
      )
      .subscribe((imageUrl) => {
        const imageObj = new Image();
        imageObj.src = imageUrl;
        imageObj.onload = () => {
          if (this.context) {
            this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
            this.context.drawImage(imageObj, 0, 0);
          }
        };
      });
  }
}
