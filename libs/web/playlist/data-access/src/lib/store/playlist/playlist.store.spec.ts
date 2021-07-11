import { ActivatedRoute, Params } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { PlaylistStore } from './playlist.store';
import { MockStore, getMockStore } from '@ngrx/store/testing';
import { getPlaylistTracksLoading } from '../playlist-tracks';
import { MemoizedSelector, Store } from '@ngrx/store';
import {
  getPlaylistsState,
  initialState as playlistsInitialState,
  PlaylistsState
} from '../playlists';
import { createServiceFactory, SpectatorService, mockProvider } from '@ngneat/spectator/jest';
import { PlayerApiService, PlaylistApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
 
describe(PlaylistStore.name, () => {
  let store: PlaylistStore;
  let spectator: SpectatorService<PlaylistStore>;

  let mockPlayerApiService;
  let mockPlaylistApiService;
  let mockActivatedRoute;
  let mockStore: MockStore;
  let mockPlaybackStore;

  let mockActivatedRouteParams: ReplaySubject<Params>;
  let mockPlaybackState: ReplaySubject<Spotify.PlaybackState>;

  let mockGetPlaylistTracksLoading: MemoizedSelector<any, boolean>;
  let mockGetPlaylistsState: MemoizedSelector<any, PlaylistsState>;  
  
  function setup() {
    mockActivatedRouteParams = new ReplaySubject(1);
    mockPlaybackState = new ReplaySubject(1);
    mockPlayerApiService = {
      togglePlay: jest.fn(),
      play: jest.fn()
    };
    mockPlaylistApiService = {
      getById: jest.fn()
    };
    mockActivatedRoute = {
      params: mockActivatedRouteParams.asObservable()
    };
    mockStore = getMockStore({
      initialState: {}
    });
    mockPlaybackStore = {
      playback$: mockPlaybackState.asObservable()
    };

    mockGetPlaylistTracksLoading = mockStore.overrideSelector(getPlaylistTracksLoading, true);
    mockGetPlaylistsState = mockStore.overrideSelector(getPlaylistsState, playlistsInitialState);
    mockStore.refreshState();

    const createService = createServiceFactory({
      service: PlaylistStore,
      providers: [
        mockProvider(PlayerApiService, mockPlayerApiService),
        mockProvider(PlaylistApiService, mockPlaylistApiService),
        mockProvider(ActivatedRoute, mockActivatedRoute),
        mockProvider(PlaybackStore, mockPlaybackStore),
        mockProvider(Store, mockStore)
      ]
    });

    spectator = createService();
  }


  describe('initialize', () => {
    it('should create instance', () => {
      setup();
      expect(spectator.service).toBeTruthy();
    });
  });
});
