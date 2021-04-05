import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  NgZone,
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
  @Input() set imageUrl(url: string) {
    this.zone.runOutsideAngular(() => {
      this.drawImageToCanvas(url);
    });
  }

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  context!: CanvasRenderingContext2D | null;

  constructor(private zone: NgZone) {}

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      this.initCanvas();
    });
  }

  drawImageToCanvas(imageUrl: string) {
    const imageObj = new Image();
    imageObj.src = imageUrl;
    imageObj.onload = () => {
      if (this.context) {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.context.drawImage(imageObj, 0, 0);
      }
    };
  }

  initCanvas() {
    this.context = this.canvas.nativeElement.getContext('2d');
    if (this.context) {
      this.context.filter = 'blur(15px)';
      this.context.globalAlpha = 0.07;
    }
  }
}
