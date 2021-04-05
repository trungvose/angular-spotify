import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  NgZone,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'as-album-art-overlay',
  templateUrl: './album-art-overlay.component.html',
  styleUrls: ['./album-art-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumArtOverlayComponent {
  @Input() set imageUrl(url: string) {
    this.zone.runOutsideAngular(() => {
      if (!this.context) {
        this.initCanvas();
      }
      this.drawImageToCanvas(url);
    });
  }

  @ViewChild('canvas', {
    static: true
  })
  canvas!: ElementRef<HTMLCanvasElement>;
  context!: CanvasRenderingContext2D | null;

  constructor(private zone: NgZone) {}

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
    this.context = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    this.context.filter = 'blur(15px)';
    this.context.globalAlpha = 0.07;
  }
}
