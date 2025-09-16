import { take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { generateCodeChallenge, generateCodeVerifier } from '../../pkce-utils';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  isLoading = false;
  error: string | null = null;
  success = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.error = null;

    this.route.queryParams.pipe(take(1)).subscribe(async (params) => {
      const currentCode = params['code'];
      const storedAccessToken = this.authService.getAndValidateAccessToken();

      if (storedAccessToken) {
        this.router.navigate(['/upload']);
      }
      else if (currentCode) {
        this.authService.exchangeCodeForToken(currentCode).subscribe({
          next: (response: any) => {
            this.router.navigate(['/upload']);
          },
          error: (err) => {
            this.error = err?.message || err || 'Something went wrong during login. Please try again.';
            this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
          },
        });
      }
      else {
        // No token, no code – start login
        await this.loginWithOkta();
        this.isLoading = false;
      }
    });
  }

  async loginWithOkta(): Promise<void> {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    localStorage.setItem('pkce_code_verifier', codeVerifier);

    const params = new URLSearchParams({
      client_id: environment.clientId,
      response_type: 'code',
      scope: 'openid profile email',
      redirect_uri: environment.redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: crypto.randomUUID(),
    });

    window.location.href = `${environment.oktaBaseUrl}/oauth2/v1/authorize?${params.toString()}`;
  }
}
