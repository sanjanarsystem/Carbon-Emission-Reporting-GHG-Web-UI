import { jwtDecode } from 'jwt-decode';
import { Injectable } from '@angular/core';
import { defer, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RoleService } from '../roles/role.service'; // Import

interface JwtPayload {
  exp: number;
  aud?: string;
  cid?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private http: HttpClient,
    private roleService: RoleService // Inject
  ) { }

  exchangeCodeForToken(code: string): Observable<any> {
    return defer(() => {
      const codeVerifier = localStorage.getItem("pkce_code_verifier");
      if (!codeVerifier) {
        throw new Error("PKCE code verifier not found");
      }

      const tokenUrl = `${environment.oktaBaseUrl}/oauth2/v1/token`;
      const userInfoBaseUrl = environment.users;
      const tokenRequestBody = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: environment.clientId,
        code,
        code_verifier: codeVerifier,
        redirect_uri: environment.redirectUri
      });

      const tokenHeaders = new HttpHeaders({ "Content-Type": "application/x-www-form-urlencoded" });

      return this.http.post(tokenUrl, tokenRequestBody.toString(), { headers: tokenHeaders }).pipe(
        map((tokenResponse: any) => {
          const accessToken = tokenResponse?.access_token;
          if (!accessToken) throw new Error("No access token received");
          const decoded = jwtDecode<any>(accessToken);
          const email = decoded?.sub;
          localStorage.setItem("access_token", accessToken);
          return { accessToken, email, originalResponse: tokenResponse };
        }),
        switchMap(({ accessToken, email, originalResponse }) => {
          if (!environment.enableAuthorization) {
            // if flag is false → skip userInfo API
            localStorage.removeItem('pkce_code_verifier');
            return of(originalResponse);
          }
          const userInfoHeaders = new HttpHeaders({
            "Authorization": `Bearer ${accessToken}`
          });

          const userInfoUrl = `${userInfoBaseUrl}?email=${email}`;
          return this.http.get(userInfoUrl, { headers: userInfoHeaders }).pipe(
            map((userResponse: any) => {
              const user = userResponse?.user;
              const roles = user?.roles || [];

              localStorage.setItem("user_email", user?.email || "");
              this.roleService.setRoles(roles); // ✅ Broadcast immediately
              localStorage.removeItem("pkce_code_verifier");

              return originalResponse;
            })
          );
        })
      );
    }).pipe(
      catchError((error) => {
        this.clearAuthData();
        const err = error?.error || error || {};
        const errorMessage =
          err.error_description ||
          err.error ||
          err.Message ||
          err.message ||
          "Authentication failed";
        return throwError(() => ({ message: errorMessage }));
      })
    );
  }

  getAndValidateAccessToken(): string | null {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.clearAuthData();
      return null;
    }

    try {
      const decoded: JwtPayload = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        this.clearAuthData();
        return null;
      }
      return token;
    } catch (e) {
      this.clearAuthData();
      return null;
    }
  }

  clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_roles');
  }
}
