import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { SavedTracksStore } from '@angular-spotify/web/shared/data-access/store';
import { LikeButtonComponent } from './like-button.component';
import { LikeButtonModule } from './like-button.module';

describe('LikeButtonComponent', () => {
  let fixture: ComponentFixture<LikeButtonComponent>;
  let component: LikeButtonComponent;
  let saved$: BehaviorSubject<boolean>;
  let store: { isSaved$: jest.Mock; toggleSave: jest.Mock };

  beforeEach(async () => {
    saved$ = new BehaviorSubject<boolean>(false);
    store = {
      isSaved$: jest.fn().mockReturnValue(saved$),
      toggleSave: jest.fn()
    };
    await TestBed.configureTestingModule({
      imports: [LikeButtonModule],
      providers: [{ provide: SavedTracksStore, useValue: store }]
    }).compileComponents();

    fixture = TestBed.createComponent(LikeButtonComponent);
    component = fixture.componentInstance;
    component.trackId = 'track-1';
    component.ngOnChanges();
    fixture.detectChanges();
  });

  it('renders the outline heart when not saved', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('is-saved')).toBe(false);
    expect(button.getAttribute('title')).toBe('Save to your Liked Songs');
  });

  it('renders the saved state when the track is saved', () => {
    saved$.next(true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('is-saved')).toBe(true);
    expect(button.getAttribute('title')).toBe('Remove from your Liked Songs');
  });

  it('toggles and stops propagation on click', () => {
    const event = { stopPropagation: jest.fn() } as unknown as MouseEvent;
    component.toggle(event, false);
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(store.toggleSave).toHaveBeenCalledWith({
      id: 'track-1',
      currentlySaved: false
    });
  });
});
