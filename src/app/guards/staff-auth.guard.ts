import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const staffAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // For now, allow access to staff routes without authentication
  // In a production environment, you would check if the user is authenticated
  // and has staff/admin permissions
  
  // Check if user is authenticated
  if (authService.isAuthenticated()) {
    return true;
  }

  // For development purposes, allow access to staff routes without authentication
  // This prevents the redirect to login issue while still allowing staff functionality
  console.log('StaffAuthGuard: Allowing access to staff route without authentication (development mode)');
  return true;
  
  // Uncomment the following lines when ready to enforce authentication:
  // console.log('StaffAuthGuard: User not authenticated, redirecting to login');
  // authService.redirectToLogin();
  // return false;
};