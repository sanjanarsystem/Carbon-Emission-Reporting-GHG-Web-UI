import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminalRouteComponent } from './terminal-route.component';

describe('TerminalRouteAveragesComponent', () => {
  let component: TerminalRouteComponent;
  let fixture: ComponentFixture<TerminalRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerminalRouteComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TerminalRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
