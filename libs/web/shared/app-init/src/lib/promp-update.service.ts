import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { SwUpdate, UpdateAvailableEvent } from '@angular/service-worker';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PromptUpdateService {
  constructor(private updates: SwUpdate, @Inject(DOCUMENT) private readonly document: Document) {}

  forceUpdate(): Observable<UpdateAvailableEvent | null> {
    if (!this.updates.isEnabled) {
      return of(null);
    }
    return this.updates.available.pipe(
      tap((version) => {
        this.updates.activateUpdate().then(() => {
          console.log(
            `[Angular Spotify] PWA is updating from ${version.current.hash} to ${version.available.hash}...`
          );
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
