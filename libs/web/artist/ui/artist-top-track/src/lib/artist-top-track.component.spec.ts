import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistTopTrackComponent } from './artist-top-track.component';

describe('ArtistTopTrackComponent', () => {
  let component: ArtistTopTrackComponent;
  let fixture: ComponentFixture<ArtistTopTrackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArtistTopTrackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtistTopTrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
