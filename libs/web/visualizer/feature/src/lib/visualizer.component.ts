import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { AudioAnalyser, initVisualizer } from '@angular-spotify/web/visualizer/data-access';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { mean } from 'lodash-es';
import { timer } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Sketch } from 'sketch-js';

const INTERVAL = 100;

@UntilDestroy()
@Component({
  selector: 'as-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisualizerComponent implements OnInit, OnDestroy {
  isFullscreen = false;
  sketch!: Sketch;
  analyser!: AudioAnalyser;

  @ViewChild('visualizer', { static: true }) visualizer!: ElementRef;

  constructor(
    private playbackStore: PlaybackStore,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  ngOnInit(): void {
    const { sketch, analyser } = initVisualizer(this.visualizer.nativeElement);
    this.sketch = sketch;
    this.analyser = analyser;
    this.init();
  }

  init() {
    this.playbackStore.segments$
      .pipe(
        switchMap((data) =>
          timer(0, INTERVAL).pipe(
            map((num) => ({
              num,
              data
            }))
          )
        ),
        tap(({ num, data }) => {
          const { position, isPlaying, segments } = data;
          if (!isPlaying) {
            return;
          }
          const currentPos = (position || 0) + num * INTERVAL;
          const segment = segments.find((segment) => segment.start >= currentPos);
          if (segment) {
            const avgPitch = mean(segment?.pitches);
            this.analyser.onUpdate(avgPitch / 2);
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  toggleFullscreen() {
    if (this.isFullscreen) {
      this.document.exitFullscreen();
    } else {
      (this.visualizer.nativeElement as HTMLElement).requestFullscreen();
    }
    this.isFullscreen = !this.isFullscreen;
  }

  ngOnDestroy() {
    this.sketch.destroy();
  }
}
