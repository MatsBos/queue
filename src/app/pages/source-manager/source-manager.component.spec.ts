import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceManagerComponent } from './source-manager.component';

describe('SourceManagerComponent', () => {
  let component: SourceManagerComponent;
  let fixture: ComponentFixture<SourceManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SourceManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SourceManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
