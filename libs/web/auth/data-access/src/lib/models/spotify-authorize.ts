import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SpotifyAuthorize {
  private readonly SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';
  private readonly CLIENT_ID = 'e676b783b5904ddeb303cb40f7b3052c';
  private readonly REDIRECT_URI = `${window.location.origin}/`; // Ensure this is registered in Spotify
  private readonly SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'; // Add the token URL
  private readonly SCOPES = [
    'user-read-recently-played',
    'user-top-read',
    'user-read-playback-position',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'playlist-modify-public',
    'playlist-modify-private',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-library-modify',
    'user-library-read',
    'user-read-email',
    'user-read-private'
  ];

  constructor(private http: HttpClient) {}

  createAuthorizeURL(codeChallenge: string): string {
    const params = new HttpParams()
      .set('client_id', this.CLIENT_ID)
      .set('redirect_uri', this.REDIRECT_URI)
      .set('scope', this.SCOPES.join(' '))
      .set('response_type', 'code')
      .set('code_challenge', codeChallenge)
      .set('code_challenge_method', 'S256');
    return `${this.SPOTIFY_AUTHORIZE_URL}?${params.toString()}`;
  }

  getAccessToken(code: string, codeVerifier: string): Observable<{ access_token: string; token_type: string; expires_in: number, refresh_token: string,  scope: string }> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    const body = new HttpParams()
      .set('client_id', this.CLIENT_ID)
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', this.REDIRECT_URI)
      .set('code_verifier', codeVerifier);

    console.info("Making call to retrieve access token");

    return this.http.post<{ access_token: string; token_type: string; expires_in: number, refresh_token: string,  scope: string }>(
      this.SPOTIFY_TOKEN_URL,
      body,
      { headers }
    );
  }

  async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(codeVerifier)
    const encrypt = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(encrypt)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  }

  generateCodeVerifier(): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(64));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  }


}
