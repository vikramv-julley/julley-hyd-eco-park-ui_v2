import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold text-center mb-8">Admin Dashboard</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4">Offerings Management</h2>
          <p class="text-gray-600 mb-4">Manage eco initiative offerings</p>
          <p-button label="Go to Offerings" routerLink="/admin/offerings" class="w-full"></p-button>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4">Categories Management</h2>
          <p class="text-gray-600 mb-4">Manage ticket categories</p>
          <p-button label="Go to Categories" routerLink="/admin/categories" class="w-full"></p-button>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4">Ticket Types</h2>
          <p class="text-gray-600 mb-4">Manage ticket types and pricing</p>
          <p-button label="Go to Ticket Types" routerLink="/admin/ticket-types" class="w-full"></p-button>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4">General Settings</h2>
          <p class="text-gray-600 mb-4">Configure system settings</p>
          <p-button label="Go to Settings" routerLink="/admin/general-settings" class="w-full"></p-button>
        </div>
      </div>
    </div>
  `
})
export class AdminComponent {
}