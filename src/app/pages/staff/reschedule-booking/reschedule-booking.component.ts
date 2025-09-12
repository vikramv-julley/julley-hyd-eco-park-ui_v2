import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { BookingsService } from '../../../services/bookings.service';
import { BookingInfo } from '../../../models/booking-info.model';

interface Message {
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail: string;
}

@Component({
  selector: 'app-reschedule-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    MessageModule,
    ProgressSpinnerModule,
    TableModule,
    TagModule,
    DialogModule
  ],
  templateUrl: './reschedule-booking.component.html',
  styleUrls: ['./reschedule-booking.component.scss']
})
export class RescheduleBookingComponent implements OnInit {
  bookingId: string = '';
  booking: BookingInfo | null = null;
  newVisitDate: Date | null = null;
  minDate: Date = new Date();
  messages: Message[] = [];
  loading: boolean = false;
  confirmDialogVisible: boolean = false;
  
  constructor(private bookingsService: BookingsService) {}

  ngOnInit(): void {
    // Set minimum date to tomorrow
    this.minDate.setDate(this.minDate.getDate() + 1);
  }

  searchBooking(): void {
    if (!this.bookingId || !this.bookingId.trim()) {
      this.messages = [{ severity: 'warn', summary: 'Warning', detail: 'Please enter a booking ID' }];
      return;
    }

    this.loading = true;
    this.messages = [];
    this.booking = null;
    this.newVisitDate = null;

    const id = parseInt(this.bookingId, 10);
    if (isNaN(id)) {
      this.loading = false;
      this.messages = [{ severity: 'error', summary: 'Error', detail: 'Invalid booking ID format' }];
      return;
    }

    this.bookingsService.getBookingById(id).subscribe({
      next: (booking) => {
        this.loading = false;
        this.booking = booking;
        
        // Check if booking can be rescheduled
        if (booking.bookingStatus === 'CANCELLED') {
          this.messages = [{ severity: 'error', summary: 'Error', detail: 'Cannot reschedule a cancelled booking' }];
          this.booking = null;
        } else if (booking.bookingStatus === 'COMPLETED') {
          this.messages = [{ severity: 'error', summary: 'Error', detail: 'Cannot reschedule a completed booking' }];
          this.booking = null;
        } else {
          // Check 12-hour restriction
          const visitDate = new Date(booking.visitDate);
          // Set visit time to midnight (start of booking day)
          visitDate.setHours(0, 0, 0, 0);
          const now = new Date();
          const hoursUntilVisit = Math.floor((visitDate.getTime() - now.getTime()) / (1000 * 60 * 60));
          
          if (hoursUntilVisit < 12) {
            this.messages = [{ 
              severity: 'error', 
              summary: 'Error', 
              detail: `Cannot reschedule within 12 hours of visit date. You have ${hoursUntilVisit} hours until your visit date. Please reschedule at least 12 hours before your visit date starts.` 
            }];
            this.booking = null;
          } else {
            this.messages = [{ severity: 'success', summary: 'Success', detail: 'Booking found. You can proceed with rescheduling.' }];
          }
        }
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 404) {
          this.messages = [{ severity: 'error', summary: 'Error', detail: 'Booking not found' }];
        } else {
          this.messages = [{ severity: 'error', summary: 'Error', detail: 'Failed to fetch booking details' }];
        }
      }
    });
  }

  showConfirmDialog(): void {
    if (!this.newVisitDate) {
      this.messages = [{ severity: 'warn', summary: 'Warning', detail: 'Please select a new visit date' }];
      return;
    }

    // Check if new date is different from current date
    const currentVisitDate = new Date(this.booking!.visitDate);
    const newDate = new Date(this.newVisitDate);
    
    if (currentVisitDate.toDateString() === newDate.toDateString()) {
      this.messages = [{ severity: 'warn', summary: 'Warning', detail: 'New date must be different from current visit date' }];
      return;
    }

    this.confirmDialogVisible = true;
  }

  confirmReschedule(): void {
    if (!this.booking || !this.newVisitDate) {
      return;
    }

    this.confirmDialogVisible = false;
    this.loading = true;
    this.messages = [];

    // Format date as YYYY-MM-DD
    const year = this.newVisitDate.getFullYear();
    const month = String(this.newVisitDate.getMonth() + 1).padStart(2, '0');
    const day = String(this.newVisitDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    this.bookingsService.rescheduleBooking(this.booking.bookingId!, formattedDate).subscribe({
      next: (response) => {
        this.loading = false;
        this.messages = [{ 
          severity: 'success', 
          summary: 'Success', 
          detail: `Booking successfully rescheduled to ${formattedDate}. New tickets have been generated.` 
        }];
        
        // Reset form after successful reschedule
        setTimeout(() => {
          this.booking = null;
          this.bookingId = '';
          this.newVisitDate = null;
          this.messages = [];
        }, 5000);
      },
      error: (error) => {
        this.loading = false;
        const errorMessage = error.error?.message || 'Failed to reschedule booking';
        this.messages = [{ severity: 'error', summary: 'Error', detail: errorMessage }];
      }
    });
  }

  cancelReschedule(): void {
    this.confirmDialogVisible = false;
  }

  resetForm(): void {
    this.booking = null;
    this.bookingId = '';
    this.newVisitDate = null;
    this.messages = [];
  }

  getBookingStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'danger';
      case 'COMPLETED':
        return 'info';
      default:
        return 'info';
    }
  }

  getPaymentStatusSeverity(status: string): 'success' | 'warning' | 'danger' {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'UNPAID':
        return 'warning';
      case 'REFUNDED':
        return 'danger';
      default:
        return 'warning';
    }
  }
}