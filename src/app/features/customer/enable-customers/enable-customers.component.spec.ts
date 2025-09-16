import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnableCustomersComponent } from './enable-customers.component';

describe('EnableCustomerForReportingComponent', () => {
  let component: EnableCustomersComponent;
  let fixture: ComponentFixture<EnableCustomersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnableCustomersComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EnableCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
