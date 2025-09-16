import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

import { Customer } from '../../model/customers';
import { DisableClientRequest } from '../../model/customer-request';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  // BehaviorSubject to trigger data refresh
  private refreshDataSubject = new BehaviorSubject<boolean>(false);
  public refreshData$ = this.refreshDataSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Method to trigger data refresh
  triggerRefresh(): void {
    this.refreshDataSubject.next(true);
  }

  // Method to reset refresh trigger
  resetRefreshTrigger(): void {
    this.refreshDataSubject.next(false);
  }

  // Method to refresh both customer lists
  refreshCustomerLists(): void {
    this.triggerRefresh();
  }

  /**Fetch Active Customer list */
  getActiveCustomerList(formValues: { clientId: string, name: string }): Observable<Customer[]> {
    // Replace this line:
     const url: string = 'assets/mock-data/customer_hierarchy.json';
    
    // With your actual API endpoint:
    //const url: string = `${environment.apiBaseUrl}/report`;
    
    // Get authorization token
    const authToken = this.authService.getAndValidateAccessToken();
    let headers = new HttpHeaders();
    
    if (authToken) {
      headers = headers.set('Authorization', `Bearer ${authToken}`);
    }
    console.log("headers:", headers);
    
    // Build query parameters - only include non-empty search criteria
    let params = new HttpParams().set('status', 'true');
    
    if (formValues.clientId && formValues.clientId.trim()) {
      params = params.set('master_client_id', formValues.clientId.trim());
    }
    
    if (formValues.name && formValues.name.trim()) {
      params = params.set('master_client_name', formValues.name.trim());
    }

    return this.http.get<{ customer_hierarchy: Customer[] }>(url, { params, headers }).pipe(
      map(response => {
        let data = response.customer_hierarchy || [];
        
        // Keep the existing filtering logic for client-side filtering if needed
        return data.filter(customer => {
          const matchesClientId = formValues.clientId && formValues.clientId.trim()
            ? customer.master_client_id?.toString().toLowerCase().includes(formValues.clientId.toLowerCase())
            : true;

          const matchesName = formValues.name && formValues.name.trim()
            ? customer.master_client_name?.toLowerCase().includes(formValues.name.toLowerCase())
            : true;

          return matchesClientId && matchesName;
        });
      })
    );
  };

  /**Fetch Disabled Customer list (status=0) */
  getDisabledCustomerList(formValues: { clientId: string, name: string }): Observable<Customer[]> {
    // API endpoint for disabled customers
    const url: string = `${environment.apiBaseUrl}/report`;
    // const url: string = 'assets/mock-data/customer_hierarchy.json';
    
    // Get authorization token
    const authToken = this.authService.getAndValidateAccessToken();
    let headers = new HttpHeaders();
    
    if (authToken) {
      headers = headers.set('Authorization', `Bearer ${authToken}`);
    }
    
    // Build query parameters - only include non-empty search criteria
    let params = new HttpParams().set('status', 'false');
    
    if (formValues.clientId && formValues.clientId.trim()) {
      params = params.set('master_client_id', formValues.clientId.trim());
    }
    
    if (formValues.name && formValues.name.trim()) {
      params = params.set('master_client_name', formValues.name.trim());
    }

    return this.http.get<{ customers: Customer[] }>(url, { params, headers }).pipe(
      map(response => {
        let data = response.customers || [];
        
        // Keep the existing filtering logic for client-side filtering if needed
        return data.filter(customer => {
          const matchesClientId = formValues.clientId && formValues.clientId.trim()
            ? customer.master_client_id?.toString().toLowerCase().includes(formValues.clientId.toLowerCase())
            : true;

          const matchesName = formValues.name && formValues.name.trim()
            ? customer.master_client_name?.toLowerCase().includes(formValues.name.toLowerCase())
            : true;

          return matchesClientId && matchesName;
        });
      })
    );
  };

  /**Update Customer List */
  updateCustomerStatus(customer: Customer): Observable<Customer> {
    return of(customer);
  };

  /**Disable Selected Clients */
  disableClients(customers: Customer[], userEmail: string): Observable<any> {
    const url: string = `${environment.apiBaseUrl}/report`;
    
    // Get authorization token
    const authToken = this.authService.getAndValidateAccessToken();
    let headers = new HttpHeaders();
    
    if (authToken) {
      headers = headers.set('Authorization', `Bearer ${authToken}`);
    }
    
    const requestBody: DisableClientRequest = {
      configs: customers.map(customer => ({
        master_client_id: customer.master_client_id,
        is_reporting_enabled: false, // Set to false to disable
        action_taken_by: userEmail
      }))
    };

    return this.http.put<any>(url, requestBody, { headers });
  }

  /**Enable Selected Clients */
  enableClients(customers: Customer[], userEmail: string): Observable<any> {
    const url: string = `${environment.apiBaseUrl}/report`;
    
    // Get authorization token
    const authToken = this.authService.getAndValidateAccessToken();
    let headers = new HttpHeaders();
    
    if (authToken) {
      headers = headers.set('Authorization', `Bearer ${authToken}`);
    }
    
    const requestBody: DisableClientRequest = {
      configs: customers.map(customer => ({
        master_client_id: customer.master_client_id,
        is_reporting_enabled: true, // Set to true to enable
        action_taken_by: userEmail
      }))
    };

    return this.http.put<any>(url, requestBody, { headers });
  }
}
