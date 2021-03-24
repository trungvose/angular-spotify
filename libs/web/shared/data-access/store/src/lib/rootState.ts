
import { ActionReducerMap } from '@ngrx/store';
import { PlaylistTracksEffect } from './playlist-tracks';
import * as fromPlaylistTracks from './playlist-tracks/playlist-tracks.reducer';
import { PlaylistsEffect } from './playlists';
import * as fromPlaylists from './playlists/playlists.reducer';
// eslint-disable-next-line
import {
  featuredPlaylistsFeatureKey,
  FeaturePlaylistsState,
  recentFeatureTracksFeatureKey,
  RecentPlayedTracksState
} from '@angular-spotify/web/home/data-access';
export interface RootState {
  playlists: fromPlaylists.State;
  playlistTracks: fromPlaylistTracks.State;
  [recentFeatureTracksFeatureKey]?: RecentPlayedTracksState;
  [featuredPlaylistsFeatureKey]?: FeaturePlaylistsState;
}

export const rootReducers: ActionReducerMap<RootState> = {
  playlists: fromPlaylists.playlistsReducer,
  playlistTracks: fromPlaylistTracks.playlistTracksReducer
};

export const rootEffects = [PlaylistsEffect, PlaylistTracksEffect];
