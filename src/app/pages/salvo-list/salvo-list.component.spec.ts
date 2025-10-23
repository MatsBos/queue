import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalvoListComponent } from './salvo-list.component';

describe('SalvoListComponent', () => {
  let component: SalvoListComponent;
  let fixture: ComponentFixture<SalvoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalvoListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalvoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
