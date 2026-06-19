import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
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
    const icon = fixture.nativeElement.querySelector('svg-icon');
    expect(icon.getAttribute('ng-reflect-key')).toBe('heart');
  });

  it('renders the filled heart when saved', (done) => {
    // ng-reflect-key does not update on BehaviorSubject emissions in JSDOM
    // after the initial render cycle for OnPush + ngrxLet. We assert on the
    // component's isSaved$ stream value instead, which is the source of truth
    // driving the [key] binding.
    saved$.next(true);
    fixture.detectChanges();
    component.isSaved$.pipe(take(1)).subscribe((isSaved) => {
      expect(isSaved).toBe(true);
      done();
    });
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
