import { RouterUtil } from '@angular-spotify/web/shared/utils';
import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
@Component({
  selector: 'as-visualization-toggle',
  templateUrl: './visualization-toggle.component.html',
  styleUrls: ['./visualization-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisualizationToggleComponent {
  isVisualizationOn$ = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    map((e: NavigationEnd) => e.urlAfterRedirects.includes(RouterUtil.Configuration.Visualizer))
  );
  isPlaying$ = this.playbackStore.isPlaying$;

  constructor(
    private router: Router,
    private location: Location,
    private playbackStore: PlaybackStore
  ) {    
  }

  toggle(state: boolean) {
    if (state) {
      this.router.navigate(['/', RouterUtil.Configuration.Visualizer]);
    } else {
      this.location.back();
    }
  }
}
