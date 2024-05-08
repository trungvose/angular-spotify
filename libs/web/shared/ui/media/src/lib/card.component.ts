import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { ClickStopPropagationModule } from '@angular-spotify/web/shared/directives/click-stop-propagation';
import { MediaCoverModule } from '@angular-spotify/web/shared/ui/media-cover';
import { PlayButtonModule } from '@angular-spotify/web/shared/ui/play-button';
import { SelectorUtil } from '@angular-spotify/web/shared/utils';

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { LetDirective, PushPipe } from '@ngrx/component';
import { Observable, combineLatest, of } from 'rxjs';
@Component({
  selector: 'as-card',
  standalone: true,
  imports: [
    RouterModule,
    LetDirective,
    PushPipe,
    MediaCoverModule,
    PlayButtonModule,
    ClickStopPropagationModule
],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent implements OnInit {
  @Input() imageUrl: string | undefined;
  @Input() title!: string;
  @Input() description!: string | null;
  @Input() routerUrl!: string;
  @Input() uri!: string;
  @Input() roundedImage? = false;
  @Output() togglePlay = new EventEmitter<boolean>();

  isMediaPlaying$!: Observable<boolean>;

  constructor(private playbackStore: PlaybackStore) {}

  ngOnInit() {
    this.isMediaPlaying$ = SelectorUtil.getMediaPlayingState(
      combineLatest([of(this.uri), this.playbackStore.playback$])
    );
  }
}
