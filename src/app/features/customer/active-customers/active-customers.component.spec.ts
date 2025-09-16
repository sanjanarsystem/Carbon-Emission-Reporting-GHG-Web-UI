import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveCustomersComponent } from './active-customers.component';

describe('ActiveCustomersListComponent', () => {
  let component: ActiveCustomersComponent;
  let fixture: ComponentFixture<ActiveCustomersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveCustomersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
