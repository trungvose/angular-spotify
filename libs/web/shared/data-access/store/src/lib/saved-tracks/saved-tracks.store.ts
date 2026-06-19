import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { TrackApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, from } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

interface SavedTracksState {
  savedMap: Record<string, boolean>;
}

const SAVE_BATCH_SIZE = 50;

@Injectable({ providedIn: 'root' })
export class SavedTracksStore extends ComponentStore<SavedTracksState> {
  readonly savedMap$ = this.select((s) => s.savedMap);

  isSaved$ = (id: string): Observable<boolean> =>
    this.select((s) => !!s.savedMap[id]);

  readonly markSaved = this.updater((state, ids: string[]) => {
    const updates: Record<string, boolean> = {};
    ids.forEach((id) => (updates[id] = true));
    return { savedMap: { ...state.savedMap, ...updates } };
  });

  readonly checkSaved = this.effect<string[]>((ids$) =>
    ids$.pipe(
      map((ids) => ids.filter((id) => !(id in this.get().savedMap))),
      filter((ids) => ids.length > 0),
      mergeMap((ids) => {
        const chunks: string[][] = [];
        for (let i = 0; i < ids.length; i += SAVE_BATCH_SIZE) {
          chunks.push(ids.slice(i, i + SAVE_BATCH_SIZE));
        }
        return from(chunks);
      }),
      mergeMap((chunk) =>
        this.trackApi.checkSavedTracks(chunk).pipe(
          tapResponse(
            (results) => {
              const updates: Record<string, boolean> = {};
              chunk.forEach((id, i) => (updates[id] = !!results[i]));
              this.patchState((s) => ({
                savedMap: { ...s.savedMap, ...updates }
              }));
            },
            () => {
              /* contains-check failures are silent */
            }
          )
        )
      )
    )
  );

  readonly toggleSave = this.effect<{ id: string; currentlySaved: boolean }>(
    (params$) =>
      params$.pipe(
        mergeMap(({ id, currentlySaved }) => {
          const nextSaved = !currentlySaved;
          this.patchState((s) => ({
            savedMap: { ...s.savedMap, [id]: nextSaved }
          }));
          const request$ = nextSaved
            ? this.trackApi.saveTracks([id])
            : this.trackApi.removeTracks([id]);
          return request$.pipe(
            tapResponse(
              () => {
                /* success is silent */
              },
              () => {
                this.patchState((s) => ({
                  savedMap: { ...s.savedMap, [id]: currentlySaved }
                }));
                this.message.error("Couldn't update Liked Songs");
              }
            )
          );
        })
      )
  );

  constructor(
    private trackApi: TrackApiService,
    private message: NzMessageService
  ) {
    super({ savedMap: {} });
  }
}
