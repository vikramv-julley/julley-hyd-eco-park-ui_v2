import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold text-center mb-8">Staff Dashboard</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4">Staff Bookings</h2>
          <p class="text-gray-600 mb-4">Manage and view all staff bookings</p>
          <p-button label="Go to Staff Bookings" routerLink="/staff/bookings" class="w-full"></p-button>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4">Booking Information</h2>
          <p class="text-gray-600 mb-4">View detailed booking information</p>
          <p-button label="Go to Booking Info" routerLink="/staff/booking-info" class="w-full"></p-button>
        </div>
      </div>
    </div>
  `
})
export class StaffComponent {
}