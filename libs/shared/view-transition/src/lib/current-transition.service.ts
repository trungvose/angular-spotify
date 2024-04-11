import { Injectable, inject, signal } from '@angular/core';
import { ViewTransitionInfo } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CurrentViewTransitionService {
  readonly currentTransition = signal<ViewTransitionInfo | null>(null);
}

export function onViewTransitionCreated(info: ViewTransitionInfo) {
  const currentTransitionService = inject(CurrentViewTransitionService);
  currentTransitionService.currentTransition.set(info);
  // Update current transition when animation finishes
  info.transition.finished.finally(() => {
    currentTransitionService.currentTransition.set(null);
  });
}

/*
  The reason for accessing the third firstChild is due to the route structure, for example when render AlbumComponent:
  AppComponent
    LayoutComponent
      /album (lazy loadChildren)
        /:albumId (lazy loadChildren)
  As a result, when receiving transition.from or transition.to, only the AppComponent route snapshot is received.
  Hence, accessing transition?.from.firstChild?.firstChild?.firstChild allows accessing the params.
*/
export function getViewTransitionParamValue(transition: ViewTransitionInfo | null, param: string) {
  if (!transition) {
    return null;
  }

  return (
    transition.from.firstChild?.firstChild?.firstChild?.paramMap.get(param) ||
    transition.to.firstChild?.firstChild?.firstChild?.paramMap.get(param)
  );
}
