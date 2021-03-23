import { ActionReducerMap } from '@ngrx/store';
import { PlaylistsEffect } from './playlists';
import { PlaylistTracksEffect } from './playlist-tracks';
import * as fromPlaylists from './playlists/playlists.reducer';
import * as fromPlaylistTracks from './playlist-tracks/playlist-tracks.reducer';
// eslint-disable-next-line
import { State as HomeState, homeFeatureKey } from '@angular-spotify/web/home/data-access';

export interface RootState {
  playlists: fromPlaylists.State;
  playlistTracks: fromPlaylistTracks.State;
  [homeFeatureKey]?: HomeState;
}

export const rootReducers: ActionReducerMap<RootState> = {
  playlists: fromPlaylists.playlistsReducer,
  playlistTracks: fromPlaylistTracks.playlistTracksReducer
};

export const rootEffects = [PlaylistsEffect, PlaylistTracksEffect];
