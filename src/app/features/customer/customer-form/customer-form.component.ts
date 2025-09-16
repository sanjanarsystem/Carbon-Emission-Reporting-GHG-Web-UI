import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { catchError, Observable, of, tap, Subscription } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';


import { CustomersService } from '../../../services/customer/customers.service';
import { Customer } from '../../../model/customers';

const APP_MATERIAL_IMPORTS = [
  MatFormFieldModule,
  MatCardModule,
  MatInputModule,
  MatButtonModule,
];

@Component({
  selector: 'puro-customer-form',
  imports: [
    ReactiveFormsModule,
    FormsModule,

    ...APP_MATERIAL_IMPORTS
  ],
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.scss'
})

export class CustomerFormComponent implements OnInit, OnDestroy {
  customerForm!: FormGroup;
  isSearchDisabled: boolean = true;

  customerList$!: Observable<Customer[]>;
  private refreshSubscription!: Subscription;

  @Input() isDisabledCustomers: boolean = false; // Default to active customers
  @Output() customerList = new EventEmitter<Customer[]>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly customerService: CustomersService
  ) { }

  ngOnInit(): void {
    this.initializeCustomerForm();
    this.handleSearchButton();
    // Only subscribe to refresh events, do not load data initially
    this.refreshSubscription = this.customerService.refreshData$.subscribe(shouldRefresh => {
      if (shouldRefresh) {
        // Reload data with current form values
        this.reloadData();
        this.customerService.resetRefreshTrigger();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  initializeCustomerForm(): void {
    this.customerForm = this.formBuilder.group({
      clientId: [''],
      name: [''],
    });
  };

  handleSearchButton(): void {
    // Search button should always be enabled
    this.isSearchDisabled = false;
  };

  onSubmit(): void {
    this.reloadData();
  }

  /**Reload data with current form values */
  private reloadData(): void {
    const formValues = this.customerForm.value;

    // Choose the appropriate service method based on the input
    const serviceCall = this.isDisabledCustomers 
      ? this.customerService.getDisabledCustomerList(formValues)
      : this.customerService.getActiveCustomerList(formValues);

    serviceCall.pipe(
      tap((customers: Customer[]) => {
        this.customerList.emit(customers);
      }),
      catchError(error => {
        console.error('Error loading customers:', error);
        this.customerList.emit([]); // emit empty on error
        return of([]);
      })
    ).subscribe();  // important! without subscribe(), observable won't execute
  }

  /**Refresh data with empty search criteria */
  public refreshWithEmptySearch(): void {
    const emptyFormValues = { clientId: '', name: '' };

    // Choose the appropriate service method based on the input
    const serviceCall = this.isDisabledCustomers 
      ? this.customerService.getDisabledCustomerList(emptyFormValues)
      : this.customerService.getActiveCustomerList(emptyFormValues);

    serviceCall.pipe(
      tap((customers: Customer[]) => {
        this.customerList.emit(customers);
      }),
      catchError(error => {
        console.error('Error loading customers:', error);
        this.customerList.emit([]); // emit empty on error
        return of([]);
      })
    ).subscribe();
  }

  clearAll(): void {
    this.customerForm.reset();
    // Clear the customer list without reloading data
    this.customerList.emit([]);
  }
}
