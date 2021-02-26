import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftNavComponent } from './left-nav.component';

describe('LeftNavComponent', () => {
  let component: LeftNavComponent;
  let fixture: ComponentFixture<LeftNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LeftNavComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeftNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
