import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `
    <div class="flex justify-center items-center h-screen">
      <div class="text-center">
        <p class="text-lg">Processing authentication...</p>
      </div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('AuthCallback: Processing authentication callback');
    this.authService.handleAuthCallback();
    
    // For now, just redirect to home after processing
    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 2000);
  }
}