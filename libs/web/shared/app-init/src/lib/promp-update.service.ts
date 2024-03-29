import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { Observable, of } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PromptUpdateService {
  constructor(private updates: SwUpdate, @Inject(DOCUMENT) private readonly document: Document) {}

  forceUpdate(): Observable<VersionEvent | null> {
    if (!this.updates.isEnabled) {
      return of(null);
    }
    return this.updates.versionUpdates.pipe(
      filter((evt) => evt.type === 'VERSION_READY'),
      tap(() => {
        this.updates.activateUpdate().then(() => {
          if (
            confirm(
              `There is a new version of Angular Spotify available! Would you like to upgrade now?`
            )
          ) {
            this.document.location.reload();
          }
        });
      })
    );
  }
}
