import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalvoDropdownComponent } from './salvo-dropdown.component';

describe('SalvoDropdownComponent', () => {
  let component: SalvoDropdownComponent;
  let fixture: ComponentFixture<SalvoDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalvoDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalvoDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
