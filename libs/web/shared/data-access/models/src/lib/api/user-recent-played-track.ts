export interface SpotifyApiPlayHistoryObject {
  track: SpotifyApi.TrackObjectFull;
  played_at: string;
  context: SpotifyApi.ContextObject;
}

export type SpotifyApiRecentPlayerTracksResponse = SpotifyApi.CursorBasedPagingObject<SpotifyApiPlayHistoryObject>