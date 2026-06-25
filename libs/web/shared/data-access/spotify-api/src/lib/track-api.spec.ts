import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { APP_CONFIG } from '@angular-spotify/web/shared/app-config';
import { TrackApiService } from './track-api';

describe('TrackApiService - saved tracks', () => {
  let service: TrackApiService;
  let httpMock: HttpTestingController;
  const baseURL = 'https://api.spotify.com/v1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TrackApiService,
        { provide: APP_CONFIG, useValue: { baseURL } }
      ]
    });
    service = TestBed.inject(TrackApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('saveTracks issues PUT /me/tracks with ids param', () => {
    service.saveTracks(['a', 'b']).subscribe();
    const req = httpMock.expectOne(
      `${baseURL}/me/tracks?ids=a,b`
    );
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  it('removeTracks issues DELETE /me/tracks with ids param', () => {
    service.removeTracks(['a', 'b']).subscribe();
    const req = httpMock.expectOne(
      `${baseURL}/me/tracks?ids=a,b`
    );
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('checkSavedTracks issues GET /me/tracks/contains and returns booleans', () => {
    let result: boolean[] | undefined;
    service.checkSavedTracks(['a', 'b']).subscribe((r) => (result = r));
    const req = httpMock.expectOne(
      `${baseURL}/me/tracks/contains?ids=a,b`
    );
    expect(req.request.method).toBe('GET');
    req.flush([true, false]);
    expect(result).toEqual([true, false]);
  });
});
