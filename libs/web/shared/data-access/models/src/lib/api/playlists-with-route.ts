export type PlaylistWithRouteUrl = SpotifyApi.PlaylistObjectSimplified & {
  routeUrl: string;
};

export type PlaylistsResponseWithRoute = SpotifyApi.PagingObject<PlaylistWithRouteUrl>;
