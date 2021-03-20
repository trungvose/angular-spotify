import { ActionReducerMap } from '@ngrx/store';
import { PlaylistsEffect } from './playlists';
import { PlaylistTracksEffect } from './playlist-tracks';
import * as fromPlaylists from './playlists/playlists.reducer';
import * as fromPlaylistTracks from './playlist-tracks/playlist-tracks.reducer';

export interface RootState {
  playlists: fromPlaylists.State;
  playlistTracks: fromPlaylistTracks.State;
}

export const rootReducers: ActionReducerMap<RootState> = {
  playlists: fromPlaylists.reducer,
  playlistTracks: fromPlaylistTracks.reducer
};

export const rootEffects = [PlaylistsEffect, PlaylistTracksEffect];
