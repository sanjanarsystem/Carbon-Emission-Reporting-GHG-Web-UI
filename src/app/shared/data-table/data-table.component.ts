import { Component, Input, ViewChild, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { debounceTime, Subject } from 'rxjs';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';

const APP_MATERIAL_IMPORTS = [
  MatTableModule,
  MatPaginatorModule,
  MatCheckboxModule,
  MatSortModule,
  MatIconModule
];

@Component({
  selector: 'puro-data-table',
  imports: [CommonModule, ...APP_MATERIAL_IMPORTS],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent<T> implements OnInit {

  @Input() displayedColumns: string[] = [];
  @Input() columnLabels: { [key: string]: string } = {};
  @Input() data: T[] = [];
  @Input() isCheckbox: boolean = false; // Whether to show checkbox for selection
  @Input() isSortingEnabled: boolean = false; // Whether to allow row selection
  @Input() isSearchEnabled: boolean = false; // Whether to allow searching/filtering
  @Input() isLoading: boolean = false; // Whether data is currently loading
  @Input() isactions: boolean = false; 

  // @Input() actions: string[] = []; // e.g. ['edit', 'delete', 'view']
  // @Output() actionClick = new EventEmitter<{ action: string, row: T }>();

  @Input() actions: string[] = []; // e.g. ['edit', 'delete', 'view']
  dataSource = new MatTableDataSource<T>([]);
  selection = new SelectionModel<T>(true, []);
  allColumns: string[] = [];
  filterValues: { [key: string]: string } = {};

  private filterSubject = new Subject<{ column: string, value: string }>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.filterSubject.pipe(
      debounceTime(300)
    ).subscribe(({ column, value }) => {
      this.filterValues[column] = value.trim().toLowerCase();
      this.dataSource.filter = JSON.stringify(this.filterValues);
    });

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.isSortingEnabled ? this.sort : null;

    if (this.isSearchEnabled) {
      this.dataSource.filterPredicate = (data: any, filter: string) => {
        const searchTerms = JSON.parse(filter);
        return Object.keys(searchTerms).every(column => {
          const value = (data[column] || '').toString().toLowerCase();
          return value.includes(searchTerms[column].toLowerCase());
        });
      };
    }
  }

  applyFilter(column: string, value: string) {
    this.filterSubject.next({ column, value });
  }

  ngOnChanges() {
    this.updateDataSource();
    this.dataSource.data = this.data || [];

      // this.allColumns =  this.isCheckbox
    //     ? ['select', ...this.displayedColumns,'actions']
    //     : [...this.displayedColumns];
     this.allColumns = this.isCheckbox
    ? ['select', ...this.displayedColumns, ...(this.isactions ? ['actions'] : [])]
    : [...this.displayedColumns, ...(this.isactions ? ['actions'] : [])];


    // Reset paginator to first page when new data is loaded
    this.resetPaginator();

    // Ensure paginator is properly connected after data change
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  private updateDataSource(): void {
    this.dataSource.data = this.data || [];

    // this.allColumns =
    //   this.isCheckbox
    //     ? ['select', ...this.displayedColumns,'actions']
    //     : [...this.displayedColumns];
      this.allColumns = this.isCheckbox
    ? ['select', ...this.displayedColumns, ...(this.isactions ? ['actions'] : [])]
    : [...this.displayedColumns, ...(this.isactions ? ['actions'] : [])];


    // Use setTimeout to ensure change detection cycle completes
    setTimeout(() => {
      this.resetPaginator();
      // Ensure paginator is properly connected after data change
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    }, 0);
  };

  toggleAllRows() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.selection.select(...this.dataSource.data);
  }

  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  /**Reset paginator to first page and clear filters */
  public resetPaginator(): void {
    // Clear any existing filters first
    this.filterValues = {};
    this.dataSource.filter = '';

    // Reset paginator to first page
    if (this.paginator) {
      this.paginator.firstPage();
      // Ensure paginator is connected to data source
      this.dataSource.paginator = this.paginator;
    }

    // Clear selection if checkbox is enabled
    if (this.isCheckbox) {
      this.selection.clear();
    }
  }

  public refreshData(): void {
    this.updateDataSource();
  }

  // onAction(action: string, row: T) {
  //   this.actionClick.emit({ action, row });
  // }
}
