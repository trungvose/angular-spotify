import { ActionReducerMap } from '@ngrx/store';
import { PlaylistsEffect } from './playlists';
import * as fromPlaylists from './playlists/playlists.reducer';

export interface RootState {
  playlists: fromPlaylists.State;
}

export const rootReducers: ActionReducerMap<RootState> = {
  playlists: fromPlaylists.reducer
};

export const rootEffects = [PlaylistsEffect];
