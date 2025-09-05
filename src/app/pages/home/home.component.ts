import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ButtonModule, CardModule, CommonModule],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  
  constructor(private router: Router) {}

  navigateToBookTickets() {
    this.router.navigate(['/book-tickets']);
  }
}
