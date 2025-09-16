import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManageUserService {

  private readonly userRoleApiUrl = environment.userRoles;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  // Get User List
  getUserRoles(): Observable<any> {
    const token = this.authService.getAndValidateAccessToken();
    if (!token) {
      this.handleInvalidToken('No valid access token available');
      return throwError(() => new Error('No valid access token available'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(this.userRoleApiUrl, { headers }).pipe(
      catchError((error) => this.handleApiError(error))
    );
  }

  // Add user
  addUser(userData: any): Observable<any> {
    const token = this.authService.getAndValidateAccessToken();
    if (!token) {
      this.handleInvalidToken('No valid access token available');
      return throwError(() => new Error('No valid access token available'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const payload = {
      email: userData.email,
      roles: userData.roles || [],
      status: userData.status,
    };

    return this.http.post(this.userRoleApiUrl, payload, { headers }).pipe(
      catchError((error) => this.handleApiError(error))
    );
  }

  // Delete user
  deleteUser(userId: number): Observable<any> {
    const token = this.authService.getAndValidateAccessToken();
    if (!token) {
      this.handleInvalidToken('No valid access token available');
      return throwError(() => new Error('No valid access token available'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const url = `${this.userRoleApiUrl}?id=${userId}`;

    return this.http.delete(url, { headers }).pipe(
      catchError((error) => this.handleApiError(error))
    );
  }

  // Update user
  updateUser(userData: any): Observable<any> {
    const token = this.authService.getAndValidateAccessToken();
    if (!token) {
      this.handleInvalidToken('No valid access token available');
      return throwError(() => new Error('No valid access token available'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const payload = {
      id: userData.id,
      email: userData.email,
      roles: userData.roles,
      status: userData.status,
    };

    return this.http.put(this.userRoleApiUrl, payload, { headers }).pipe(
      catchError((error) => this.handleApiError(error))
    );
  }

  // Handles 403 errors and invalid tokens
  private handleApiError(error: any): Observable<never> {
    const status = error.status;
    const message = error.error?.error || error.error?.message || 'Something went wrong';

    if (status === 403) {
      this.handleInvalidToken(message);
    }

    return throwError(() => error);
  }

  // Show message and logout
  private handleInvalidToken(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });

    this.authService.clearAuthData();
    this.router.navigate(['/']);
  }
}
