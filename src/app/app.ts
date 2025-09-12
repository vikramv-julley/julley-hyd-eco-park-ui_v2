import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MenuItem } from 'primeng/api';
import { AuthService } from './services/auth.service';
import { AuthUser } from './models/auth.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, CommonModule, MenubarModule, ButtonModule, CardModule, ToastModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit, OnDestroy {
  title = 'Hyderabad Eco Initiative';
  currentUser: AuthUser | null = null;
  menuItems: MenuItem[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.updateMenuItems();
      })
    );
    this.updateMenuItems(); // Initialize menu on startup
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  updateMenuItems(): void {
    const homeMenu = {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: '/home'
    };

    const bookingMenu = {
      label: 'Book Tickets',
      icon: 'pi pi-ticket',
      routerLink: '/book-tickets'
    };

    const staffMenu = {
      label: 'Staff',
      icon: 'pi pi-users',
      items: [
        {
          label: 'Staff Bookings',
          icon: 'pi pi-calendar',
          routerLink: '/staff/bookings'
        },
        {
          label: 'Booking Info',
          icon: 'pi pi-info-circle',
          routerLink: '/staff/booking-info'
        },
        {
          label: 'QR Scanner',
          icon: 'pi pi-qrcode',
          routerLink: '/staff/scan-ticket'
        },
        {
          label: 'Reschedule Booking',
          icon: 'pi pi-calendar-plus',
          routerLink: '/staff/reschedule-booking'
        }
      ]
    };

    const rescheduleMenu = {
      label: 'Reschedule',
      icon: 'pi pi-calendar-plus',
      routerLink: '/staff/reschedule-booking'
    };

    const adminMenu = {
      label: 'Admin',
      icon: 'pi pi-cog',
      items: [
        {
          label: 'General Settings',
          icon: 'pi pi-cog',
          routerLink: '/admin/general-settings'
        },
        {
          label: 'Offerings',
          icon: 'pi pi-box',
          routerLink: '/admin/offerings'
        },
        {
          label: 'Categories',
          icon: 'pi pi-tags',
          routerLink: '/admin/categories'
        },
        {
          label: 'Ticket Types',
          icon: 'pi pi-ticket',
          routerLink: '/admin/ticket-types'
        },
        {
          label: 'User Management',
          icon: 'pi pi-users',
          routerLink: '/admin/users'
        },
        {
          label: 'Dashboard',
          icon: 'pi pi-chart-bar'
        }
      ]
    };

    // Default: show Home and Book Tickets
    this.menuItems = [homeMenu, bookingMenu];

    // Add menus based on user groups
    if (this.currentUser?.groups) {
      if (this.currentUser.groups.includes('ADMIN')) {
        // ADMIN: show all menus including standalone Reschedule button
        this.menuItems = [homeMenu, bookingMenu, staffMenu, adminMenu, rescheduleMenu];
      } else if (this.currentUser.groups.includes('STAFF')) {
        // STAFF: show home, booking, staff menus, and standalone Reschedule button
        this.menuItems = [homeMenu, bookingMenu, staffMenu, rescheduleMenu];
      }
    }
  }

  openLogin() {
    console.log('App: Redirecting to Cognito hosted UI...');
    this.authService.redirectToLogin();
  }

  onLogout() {
    console.log('App: Logging out user...');
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
