import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { CustomerFormComponent } from '../customer-form/customer-form.component';
import { Customer } from '../../../model/customers';
import { DialogComponent } from '../../../shared/dialog/dialog.component';
import { CustomersService } from '../../../services/customer/customers.service';
import { CommonDialogData } from '../../../model/common-dialog';

const APP_MATERIAL_IMPORTS = [
  MatCardModule,
  MatButtonModule,
  MatSnackBarModule,
];

@Component({
  selector: 'puro-enable-customers',
  imports: [
    CommonModule,
    DataTableComponent,
    CustomerFormComponent,

    ...APP_MATERIAL_IMPORTS
  ],
  templateUrl: './enable-customers.component.html',
  styleUrl: './enable-customers.component.scss'
})
export class EnableCustomersComponent implements OnInit, OnDestroy {
  @ViewChild('dataTable') dataTable?: DataTableComponent<Customer>;
  customerList$?: Observable<Customer[]>;
  isLoading = false;
  selectedCustomers: Customer[] = [];

  private refreshSubscription!: Subscription;

  columns: string[] = ['master_client_id', 'master_client_name'];
  columnLabels: { [key: string]: string } = {
    master_client_id: 'Master Client ID',
    master_client_name: 'Master Client Name'
  };

  constructor(
    private readonly dialog: MatDialog,
    private readonly customersService: CustomersService,
    private readonly snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    // Subscribe to refresh events
    this.refreshSubscription = this.customersService.refreshData$.subscribe(shouldRefresh => {
      if (shouldRefresh) {
        this.refreshData();
        this.customersService.resetRefreshTrigger();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  receiveData(customers: Customer[]): void {
    this.isLoading = false;
    this.customerList$ = of(customers || []);
    // Use setTimeout to ensure data is loaded before resetting paginator
    setTimeout(() => {
      this.dataTable?.resetPaginator();
    }, 100);
  }


  onEnableConfirm(selectedCustomers: Customer[]): void {
    if (!selectedCustomers || selectedCustomers.length === 0) {
      this.snackBar.open('Please select at least one client to enable', 'Close', { duration: 3000 });
      return;
    }

    const dialogData: CommonDialogData = {
      title: 'Enable Clients Confirmation',
      subtitle: 'You are going to enable clients',
      message: 'Click Confirm button if you want to proceed. Otherwise, click Cancel.',
      data: selectedCustomers,
      width: '600px',
      disableClose: true,
      confirmText: 'Confirm',
      cancelText: 'Cancel'
    };

    this.dialog.open(DialogComponent, {
      data: dialogData,
      width: dialogData.width || '600px',
      disableClose: dialogData.disableClose || false
    }).afterClosed().subscribe(result => {
      if (result) {
        this.enableSelectedClients(selectedCustomers);
        // Reset selection in parent after action
        this.selectedCustomers = [];
      }
    });
  }

  /**Enable the selected clients */
  private enableSelectedClients(customers: Customer[]): void {
    // Get user email from localStorage or auth service
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com'; // Replace with actual user email

    this.customersService.enableClients(customers, userEmail).pipe(
      tap(() => {
        this.snackBar.open('Clients enabled successfully', 'Close', { duration: 3000 });
        // Trigger data refresh after successful enable
        this.customersService.triggerRefresh();
        // Clear selection after refresh
        setTimeout(() => this.dataTable?.selection.clear(), 0);
      }),
      catchError(error => {
        console.error('Error enabling clients:', error);
        this.snackBar.open('Error enabling clients. Please try again.', 'Close', { duration: 3000 });
        return of(null);
      }),
      finalize(() => {
        // Clear selection after refresh
        setTimeout(() => this.dataTable?.selection.clear(), 0);
      })
    ).subscribe();
  }

  /**Refresh data method */
  private refreshData(): void {
    this.isLoading = true;
    // Trigger a refresh by calling the customer form's refresh method
    // This will reload the data with current search criteria
    console.log('Data refresh triggered for enable customers');
    // The refresh will be handled by the customer form component automatically
  }
}
