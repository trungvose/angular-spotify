import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ComponentStore } from '@ngrx/component-store';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { RouterUtil } from '@angular-spotify/web/shared/utils';

interface VisualizerState {
  isFirstTime: boolean;
  isShownAsPiP: boolean;
  isVisible: boolean;
}

@Injectable({ providedIn: 'root' })
export class VisualizerStore extends ComponentStore<VisualizerState> {
  constructor(private router: Router, private location: Location) {
    super({ isVisible: false, isShownAsPiP: false, isFirstTime: true });
    this.showVisualizerAsPiP$();
  }

  readonly isShownAsPiP$ = this.select((s) => s.isShownAsPiP);
  readonly isVisible$ = this.select((s) => s.isVisible);
  readonly showPiPVisualizer$ = this.select((s) => s.isVisible && s.isShownAsPiP);

  readonly showVisualizerAsPiP$ = this.effect(() =>
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e: NavigationEnd) => e.urlAfterRedirects.includes(RouterUtil.Configuration.Visualizer)),
      withLatestFrom(this.state$),
      tap(([isAtVisualizerRoute, state]) => {
        if (isAtVisualizerRoute) {
          this.setState({ isFirstTime: false, isVisible: true, isShownAsPiP: false });
        }
        if (!isAtVisualizerRoute && !state.isFirstTime) {
          this.setState({ ...state, isShownAsPiP: true });
        }
      })
    )
  );

  readonly setVisibility = this.effect<{ isVisible: boolean }>((params$) =>
    params$.pipe(
      tap(({ isVisible }) => {
        this.patchState({ isVisible, isFirstTime: !isVisible });
      }),
      map(() => this.get()),
      tap((state) => this.handleStateChange(state))
    )
  );

  readonly togglePiP = this.effect((params$) =>
    params$.pipe(
      withLatestFrom(this.isShownAsPiP$),
      tap(([, isShownAsPiP]) => {
        this.patchState({ isShownAsPiP: !isShownAsPiP });
      }),
      map(() => this.get()),
      tap((state) => this.handleStateChange(state))
    )
  );

  private handleStateChange({ isVisible, isShownAsPiP }: VisualizerState) {
    if (!isVisible) {
      this.patchState({ isFirstTime: true, isShownAsPiP: false, isVisible: false });
    }

    if (isVisible && !isShownAsPiP) {
      this.router.navigate(['/', RouterUtil.Configuration.Visualizer]);
    }

    if ((isVisible && isShownAsPiP) || (!isVisible && !isShownAsPiP)) {
      if (this.location.path().includes(RouterUtil.Configuration.Visualizer)) {
        this.location.back();
      }
    }
  }
}
