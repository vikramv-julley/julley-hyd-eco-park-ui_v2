import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = localStorage.getItem('access_token');
  
  // Skip auth for certain endpoints
  if (req.url.includes('/auth/callback') || req.url.includes('/auth/refresh') || req.url.includes('/oauth2/token')) {
    return next(req);
  }

  // Check if token is expired before making request
  if (token && authService.isTokenExpired()) {
    console.log('AuthInterceptor: Token expired, refreshing...');
    return authService.refreshToken().pipe(
      switchMap(() => {
        // Retry original request with new token
        const newToken = localStorage.getItem('access_token');
        const authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${newToken}`)
        });
        return next(authReq);
      }),
      catchError((error) => {
        console.error('AuthInterceptor: Token refresh failed, redirecting to login');
        authService.redirectToLogin();
        return throwError(() => error);
      })
    );
  }

  // Add token to request if available
  let authReq = req;
  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  // Handle the request and catch 401 errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If we get a 401 and have a refresh token, try to refresh
      if (error.status === 401 && authService.getRefreshToken() && !req.url.includes('/auth/refresh') && !req.url.includes('/oauth2/token')) {
        console.log('AuthInterceptor: 401 received, attempting token refresh...');
        
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Retry original request with new token
            const newToken = localStorage.getItem('access_token');
            const retryReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${newToken}`)
            });
            console.log('AuthInterceptor: Retrying original request with new token');
            return next(retryReq);
          }),
          catchError((refreshError) => {
            console.error('AuthInterceptor: Token refresh failed on 401, redirecting to login');
            authService.redirectToLogin();
            return throwError(() => refreshError);
          })
        );
      }
      
      // For other errors or if no refresh token, pass through
      return throwError(() => error);
    })
  );
};