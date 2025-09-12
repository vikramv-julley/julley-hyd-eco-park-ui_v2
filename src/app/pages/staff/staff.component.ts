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
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div class="flex items-center mb-4">
            <i class="pi pi-qrcode text-2xl text-green-600 mr-3"></i>
            <h2 class="text-xl font-semibold">Ticket Scanner</h2>
          </div>
          <p class="text-gray-600 mb-4">Scan QR codes to validate and admit visitors</p>
          <p-button 
            label="Open Scanner" 
            icon="pi pi-camera"
            routerLink="/staff/scan-ticket" 
            class="w-full"
            styleClass="p-button-success">
          </p-button>
        </div>
      </div>
    </div>
  `
})
export class StaffComponent {
}