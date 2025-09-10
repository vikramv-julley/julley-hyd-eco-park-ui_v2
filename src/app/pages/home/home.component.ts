import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ButtonModule, CardModule, CommonModule],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  
  constructor(private authService: AuthService) {}

  navigateToBookTickets() {
    // Redirect to Cognito hosted UI for login
    this.authService.redirectToLogin();
  }
}
