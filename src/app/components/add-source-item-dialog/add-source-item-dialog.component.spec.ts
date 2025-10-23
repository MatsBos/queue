import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSourceItemDialogComponent } from './add-source-item-dialog.component';

describe('AddSourceItemDialogComponent', () => {
  let component: AddSourceItemDialogComponent;
  let fixture: ComponentFixture<AddSourceItemDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSourceItemDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddSourceItemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
