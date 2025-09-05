import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, AuthUser } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Redirect to Cognito hosted UI for authentication
   */
  redirectToLogin(): void {
    const loginUrl = this.buildCognitoLoginUrl();
    console.log('AuthService: Redirecting to Cognito hosted UI:', loginUrl);
    window.location.href = loginUrl;
  }

  /**
   * Build the Cognito hosted UI login URL
   */
  private buildCognitoLoginUrl(): string {
    const params = new URLSearchParams({
      response_type: environment.cognito.responseType,
      client_id: environment.cognito.clientId,
      redirect_uri: environment.cognito.redirectSignIn,
      scope: 'openid email phone'
    });

    return `https://${environment.cognito.domain}/login?${params.toString()}`;
  }

  /**
   * Handle authentication callback (when user returns from Cognito)
   * This would be called on the callback route
   */
  handleAuthCallback(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('AuthService: Authentication error:', error);
      return;
    }

    if (authCode) {
      console.log('AuthService: Received authorization code:', authCode);
      this.exchangeCodeForToken(authCode);
    }
  }

  /**
   * Exchange authorization code for tokens via backend API
   */
  private exchangeCodeForToken(code: string): void {
    const payload = {
      code: code,
      redirectUri: environment.cognito.redirectSignIn
    };

    console.log('AuthService: Exchanging code for token via API...');
    
    this.http.post<AuthResponse>(`${environment.apiUrl}/api/v1/auth/callback`, payload)
      .subscribe({
        next: (response) => {
          console.log('AuthService: Token exchange successful:', response);
          
          // Create user object from response
          const user: AuthUser = {
            id: response.user_id,
            username: response.username,
            email: response.email,
            emailVerified: response.email_verified,
            groups: response.groups,
            loginTime: new Date(response.login_time),
            expiresAt: new Date(response.expires_at)
          };
          
          this.currentUserSubject.next(user);
          console.log('AuthService: User details saved:', user);
          
          // Store tokens in localStorage
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
          localStorage.setItem('id_token', response.id_token);
        },
        error: (error) => {
          console.error('AuthService: Token exchange failed:', error);
          this.currentUserSubject.next(null);
        }
      });
  }

  /**
   * Logout user and clear user data
   */
  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('id_token');
    console.log('AuthService: User logged out locally');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Redirect to Cognito hosted UI for logout
   */
  redirectToLogout(): void {
    const logoutUrl = this.buildCognitoLogoutUrl();
    console.log('AuthService: Redirecting to Cognito logout:', logoutUrl);
    window.location.href = logoutUrl;
  }

  /**
   * Build the Cognito hosted UI logout URL
   */
  private buildCognitoLogoutUrl(): string {
    const params = new URLSearchParams({
      client_id: environment.cognito.clientId,
      logout_uri: environment.cognito.redirectSignOut
    });

    return `https://${environment.cognito.domain}/logout?${params.toString()}`;
  }
}