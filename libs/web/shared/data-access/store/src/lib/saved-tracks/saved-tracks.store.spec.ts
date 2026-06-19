import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import { TrackApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SavedTracksStore } from './saved-tracks.store';

describe('SavedTracksStore', () => {
  let store: SavedTracksStore;
  let trackApi: {
    saveTracks: jest.Mock;
    removeTracks: jest.Mock;
    checkSavedTracks: jest.Mock;
  };
  let message: { error: jest.Mock };

  const currentSaved = (id: string): boolean | undefined => {
    let value: boolean | undefined;
    store.isSaved$(id).pipe(take(1)).subscribe((v) => (value = v));
    return value;
  };

  beforeEach(() => {
    trackApi = {
      saveTracks: jest.fn().mockReturnValue(of(undefined)),
      removeTracks: jest.fn().mockReturnValue(of(undefined)),
      checkSavedTracks: jest.fn().mockReturnValue(of([]))
    };
    message = { error: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        SavedTracksStore,
        { provide: TrackApiService, useValue: trackApi },
        { provide: NzMessageService, useValue: message }
      ]
    });
    store = TestBed.inject(SavedTracksStore);
  });

  it('checkSaved fills savedMap from the contains response', () => {
    trackApi.checkSavedTracks.mockReturnValue(of([true, false]));
    store.checkSaved(['a', 'b']);
    expect(trackApi.checkSavedTracks).toHaveBeenCalledWith(['a', 'b']);
    expect(currentSaved('a')).toBe(true);
    expect(currentSaved('b')).toBe(false);
  });

  it('checkSaved skips ids already known', () => {
    store.markSaved(['a']);
    store.checkSaved(['a']);
    expect(trackApi.checkSavedTracks).not.toHaveBeenCalled();
  });

  it('toggleSave optimistically saves and calls saveTracks', () => {
    store.toggleSave({ id: 'a', currentlySaved: false });
    expect(currentSaved('a')).toBe(true);
    expect(trackApi.saveTracks).toHaveBeenCalledWith(['a']);
  });

  it('toggleSave optimistically removes and calls removeTracks', () => {
    store.markSaved(['a']);
    store.toggleSave({ id: 'a', currentlySaved: true });
    expect(currentSaved('a')).toBe(false);
    expect(trackApi.removeTracks).toHaveBeenCalledWith(['a']);
  });

  it('toggleSave reverts and toasts on error', () => {
    trackApi.saveTracks.mockReturnValue(throwError(() => new Error('boom')));
    store.toggleSave({ id: 'a', currentlySaved: false });
    expect(currentSaved('a')).toBe(false);
    expect(message.error).toHaveBeenCalled();
  });
});
