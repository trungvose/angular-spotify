export class SpotifyAuthorize {
  SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';
  TOKEN_URL = 'https://accounts.spotify.com/api/token';
  CLIENT_ID = 'd06c09470bb646ebb33f27616fb151fb';
  SCOPES = [
    //Listening History
    'user-read-recently-played',
    'user-top-read',
    'user-read-playback-position',
    //Spotify Connect
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    //Playback - For SDK Playback //https://developer.spotify.com/documentation/web-playback-sdk/quick-start/
    'streaming',
    //Playlists
    'playlist-modify-public',
    'playlist-modify-private',
    'playlist-read-private',
    'playlist-read-collaborative',
    //Library
    'user-library-modify',
    'user-library-read',
    //Users - For SDK Playback //https://developer.spotify.com/documentation/web-playback-sdk/quick-start/
    'user-read-email',
    'user-read-private'
  ];

  generateRandomString(length: number) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  }

  sha256(plain: string) {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest('SHA-256', data)
  }

  base64encode(input: ArrayBuffer) {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  async createAuthorizeURL(): Promise<{ url: URL; codeVerifier: string }> {
    const codeVerifier = this.generateRandomString(128);
    const hash = await this.sha256(codeVerifier);
    const codeChallenge = this.base64encode(hash);

    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      response_type: 'code',
      redirect_uri: `${window.location.origin}/`,
      scope: this.SCOPES.join(' '),
      code_challenge_method: 'S256',
      code_challenge: codeChallenge
    });

    const authUrl = new URL(this.SPOTIFY_AUTHORIZE_URL);
    authUrl.search = new URLSearchParams(params).toString();
    return { url: authUrl, codeVerifier };
  }
}
