import { ComponentStore } from '@ngrx/component-store';
import { Injectable } from '@angular/core';

import { GenericState } from '@angular-spotify/web/shared/data-access/models';

type SearchState = GenericState<
  Pick<SpotifyApi.SearchResponse, 'tracks' | 'artists' | 'albums' | 'playlists'>
>;

@Injectable()
export class SearchStore extends ComponentStore<SearchState> {
  constructor() {
    super(<SearchState>{});
  }
}
