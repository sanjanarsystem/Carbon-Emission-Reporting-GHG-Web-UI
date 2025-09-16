import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service'; // Make sure the path is correct

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  canActivate(): boolean {
    const isLoggedIn = this.authService.getAndValidateAccessToken();
    if (isLoggedIn == null) {
      this.router.navigate(['/']); // Redirect to okta login page
    }
    return true;
  }
}
