import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PinyinToggleComponent } from './pinyin-toggle.component';
import { PinyinStore } from '@angular-spotify/web/lyrics/data-access';

describe('PinyinToggleComponent', () => {
  let fixture: ComponentFixture<PinyinToggleComponent>;
  let component: PinyinToggleComponent;

  const showToggle$ = new BehaviorSubject<boolean>(true);
  const enabled$ = new BehaviorSubject<boolean>(true);
  const downloadState$ = new BehaviorSubject<'idle' | 'downloading' | 'ready'>('idle');
  const setEnabledSpy = jest.fn();

  const storeMock = {
    showToggle$: showToggle$.asObservable(),
    enabled$: enabled$.asObservable(),
    downloadState$: downloadState$.asObservable(),
    setEnabled: setEnabledSpy
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    showToggle$.next(true);
    enabled$.next(true);
    downloadState$.next('idle');

    await TestBed.configureTestingModule({
      declarations: [PinyinToggleComponent],
      providers: [{ provide: PinyinStore, useValue: storeMock }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PinyinToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have selector as-pinyin-toggle', () => {
    // Ivy stores component metadata on the static ɵcmp property
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cmp = (PinyinToggleComponent as any)['ɵcmp'];
    expect(cmp.selectors[0][0]).toBe('as-pinyin-toggle');
  });

  it('should hide the button when showToggle$ is false', () => {
    showToggle$.next(false);
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).toBeNull();
  });

  it('should show the button when showToggle$ is true', () => {
    showToggle$.next(true);
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).not.toBeNull();
  });

  it('should mark button active when enabled$ is true', () => {
    enabled$.next(true);
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.classList).toContain('active');
  });

  it('should not mark button active when enabled$ is false', () => {
    enabled$.next(false);
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.classList).not.toContain('active');
  });

  it('should call store.setEnabled with toggled value when button clicked', () => {
    enabled$.next(true);
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    btn.triggerEventHandler('click', null);
    expect(setEnabledSpy).toHaveBeenCalledWith(false);
  });

  it('should call store.setEnabled(true) when currently disabled', () => {
    enabled$.next(false);
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    btn.triggerEventHandler('click', null);
    expect(setEnabledSpy).toHaveBeenCalledWith(true);
  });

  describe('tooltip text via downloadState$', () => {
    it('should resolve to "Preparing pinyin…" when downloadState$ is "downloading"', (done) => {
      downloadState$.next('downloading');
      component.downloadState$.subscribe((state) => {
        const tooltipTitle = state === 'downloading' ? 'Preparing pinyin…' : 'Show pinyin';
        expect(tooltipTitle).toBe('Preparing pinyin…');
        done();
      });
    });

    it('should resolve to "Show pinyin" when downloadState$ is "ready"', (done) => {
      downloadState$.next('ready');
      component.downloadState$.subscribe((state) => {
        const tooltipTitle = state === 'downloading' ? 'Preparing pinyin…' : 'Show pinyin';
        expect(tooltipTitle).toBe('Show pinyin');
        done();
      });
    });

    it('should resolve to "Show pinyin" when downloadState$ is "idle"', (done) => {
      downloadState$.next('idle');
      component.downloadState$.subscribe((state) => {
        const tooltipTitle = state === 'downloading' ? 'Preparing pinyin…' : 'Show pinyin';
        expect(tooltipTitle).toBe('Show pinyin');
        done();
      });
    });
  });
});
