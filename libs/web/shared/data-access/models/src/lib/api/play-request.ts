export interface SpotifyPlayRequestApi {
  device_id?: string;
  context_uri?: string;
  uris?: string[];
  offset?: { position: number };
}
