import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { DataTableComponent } from './data-table.component';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';

interface TestData {
  id: number;
  name: string;
}

describe('DataTableComponent', () => {
  let component: DataTableComponent<TestData>;
  let fixture: ComponentFixture<DataTableComponent<TestData>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatSortModule
      ],
      declarations: [DataTableComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent<DataTableComponent<TestData>>(DataTableComponent);
    component = fixture.componentInstance;

    // Provide default inputs
    component.displayedColumns = ['id', 'name'];
    component.columnLabels = { id: 'ID', name: 'Name' };
    component.data = [
      { id: 1, name: 'Test One' },
      { id: 2, name: 'Test Two' }
    ];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize dataSource data on input change', () => {
    component.ngOnChanges();
    expect(component.dataSource.data.length).toBe(2);
    expect(component.dataSource.data[0].name).toBe('Test One');
  });

  it('should include "select" column when isCheckbox is true', () => {
    component.isCheckbox = true;
    component.ngOnChanges();
    expect(component.allColumns[0]).toBe('select');
  });

  it('should not include "select" column when isCheckbox is false', () => {
    component.isCheckbox = false;
    component.ngOnChanges();
    expect(component.allColumns[0]).toBe('id');
  });

  it('should toggle all rows selection', () => {
    component.ngOnChanges();
    component.toggleAllRows();
    expect(component.selection.selected.length).toBe(component.data.length);
    component.toggleAllRows();
    expect(component.selection.selected.length).toBe(0);
  });

  it('should return true for isAllSelected when all rows selected', () => {
    component.ngOnChanges();
    component.selection.select(...component.data);
    expect(component.isAllSelected()).toBeTrue();
  });

  it('should return false for isAllSelected when not all rows selected', () => {
    component.ngOnChanges();
    component.selection.select(component.data[0]);
    expect(component.isAllSelected()).toBeFalse();
  });

  it('should apply filter and filter dataSource', () => {
    component.ngOnChanges();
    component.isSearchEnabled = true;
    component.ngAfterViewInit();

    // Filter by name 'Test One'
    component.applyFilter('name', 'Test One');

    expect(component.dataSource.filteredData.length).toBe(1);
    expect(component.dataSource.filteredData[0].name).toBe('Test One');
  });
});
