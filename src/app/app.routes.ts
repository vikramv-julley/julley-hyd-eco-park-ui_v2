import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { 
    path: 'home', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'book-tickets', 
    loadComponent: () => import('./pages/book-tickets/book-tickets.component').then(m => m.BookTicketsComponent) 
  },
  { 
    path: 'staff', 
    loadComponent: () => import('./pages/staff/staff.component').then(m => m.StaffComponent) 
  },
  { 
    path: 'staff/bookings', 
    loadComponent: () => import('./pages/staff/staff-bookings/staff-bookings.component').then(m => m.StaffBookingsComponent) 
  },
  { 
    path: 'staff/booking-info', 
    loadComponent: () => import('./pages/staff/booking-info/booking-info.component').then(m => m.BookingInfoComponent) 
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent) 
  },
  { 
    path: 'admin/offerings', 
    loadComponent: () => import('./pages/admin/offerings/offerings.component').then(m => m.OfferingsComponent) 
  },
  { 
    path: 'admin/categories', 
    loadComponent: () => import('./pages/admin/categories/categories.component').then(m => m.CategoriesComponent) 
  },
  { 
    path: 'admin/ticket-types', 
    loadComponent: () => import('./pages/admin/ticket-types/ticket-types.component').then(m => m.TicketTypesComponent) 
  },
  { 
    path: 'admin/general-settings', 
    loadComponent: () => import('./pages/admin/general-settings/general-settings.component').then(m => m.GeneralSettingsComponent) 
  },
  { 
    path: 'admin/users', 
    loadComponent: () => import('./pages/admin/users/users.component').then(m => m.UsersComponent) 
  },
  { 
    path: 'admin/special-days', 
    loadComponent: () => import('./pages/admin/special-days/special-days.component').then(m => m.SpecialDaysComponent) 
  },
  { 
    path: 'callback', 
    loadComponent: () => import('./pages/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent) 
  },
  { path: '**', redirectTo: '/home' }
];
