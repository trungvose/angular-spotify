import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavBarPlaylistComponent } from './nav-bar-playlist.component';

describe('NavBarPlaylistComponent', () => {
  let component: NavBarPlaylistComponent;
  let fixture: ComponentFixture<NavBarPlaylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavBarPlaylistComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavBarPlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
