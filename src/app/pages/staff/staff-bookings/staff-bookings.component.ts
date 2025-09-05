import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DialogModule } from 'primeng/dialog';
import { OfferingsService } from '../../../services/offerings.service';
import { TicketTypesService } from '../../../services/ticket-types.service';
import { ToastService } from '../../../services/toast.service';
import { BookingsService } from '../../../services/bookings.service';
import { Offering } from '../../../models/offering.model';
import { TicketType } from '../../../models/ticket-type.model';
import { BookingInfo, BookingItem, CreateBookingRequest } from '../../../models/booking-info.model';

@Component({
  selector: 'app-staff-bookings',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, DatePickerModule, MultiSelectModule, ButtonModule, PanelModule, InputNumberModule, InputTextModule, RadioButtonModule, DialogModule],
  templateUrl: './staff-bookings.component.html'
})
export class StaffBookingsComponent implements OnInit {

  selectedDate: Date = new Date();
  minDate: Date = new Date();
  selectedOfferings: Offering[] = [];
  offerings: Offering[] = [];
  ticketTypes: TicketType[] = [];
  showTicketSelection: boolean = false;
  grandTotal: number = 0;
  showBookingDialog: boolean = false;
  customerName: string = '';
  customerEmail: string = '';
  customerPhone: string = '';
  paymentMethod: string = '';
  showPrintButton: boolean = false;
  lastBookingId: number | null = null;

  private offeringsService = inject(OfferingsService);
  private ticketTypesService = inject(TicketTypesService);
  private toastService = inject(ToastService);
  private bookingsService = inject(BookingsService);

  ngOnInit() {
    this.loadOfferings();
  }

  loadOfferings() {
    this.offeringsService.getOfferings().subscribe({
      next: (data: Offering[]) => {
        this.offerings = data.filter(offering => offering.is_active);
      },
      error: (error: any) => {
        this.toastService.showError('Failed to load offerings');
      }
    });
  }

  onGoClick() {
    if (!this.selectedDate) {
      this.toastService.showWarn('Please select a date');
      return;
    }

    if (!this.selectedOfferings || this.selectedOfferings.length === 0) {
      this.toastService.showWarn('Please select at least one offering');
      return;
    }

    this.loadTicketTypes();
  }

  loadTicketTypes() {
    const offeringIds = this.selectedOfferings.map(offering => offering.offering_id);
    console.log('Offering IDs:', offeringIds);
    console.log('Selected Offerings:', this.selectedOfferings);

    this.ticketTypesService.getActiveTicketTypesByOfferings(offeringIds).subscribe({
      next: (data: TicketType[]) => {
        this.ticketTypes = data;
        this.showTicketSelection = true;
        console.log('Loaded Ticket Types:', this.ticketTypes);
        console.log('Show Ticket Selection:', this.showTicketSelection);
      },
      error: (error: any) => {
        console.error('Error loading ticket types:', error);
        this.toastService.showError('Failed to load ticket types');
        this.showTicketSelection = false;
      }
    });
  }

  getTicketTypesForOffering(offeringId: number): TicketType[] {
    return this.ticketTypes.filter(ticketType => ticketType.offering_id === offeringId);
  }

  updateTotal(): void {
    this.grandTotal = this.ticketTypes.reduce((total, ticketType) => {
      const qty = Number(ticketType.no_of_tickets) || 0;   // handle null, undefined, NaN
      const price = Number(ticketType.unit_price) || 0;    // same for unit price
      return total + qty * price;
    }, 0);

    console.log('Grand Total:', this.grandTotal);
  }

  resetAll(): void {
    this.ticketTypes.forEach(ticketType => {
      ticketType.no_of_tickets = 0;
    });
    this.grandTotal = 0;
  }

  onBookTickets(): void {
    if (this.grandTotal === 0) {
      this.toastService.showWarn('Please select at least one ticket');
      return;
    }
    this.showBookingDialog = true;
  }

  confirmBooking(): void {
    if (!this.validateBookingForm()) {
      return;
    }
    
    const bookingRequest = this.createBookingRequest();
    
    this.bookingsService.createBooking(bookingRequest).subscribe({
      next: (response: any) => {
        this.lastBookingId = response.id || response.booking_id;
        this.showPrintButton = true;
        this.toastService.showSuccess('Booking confirmed successfully!');
        this.showBookingDialog = false;
      },
      error: (error: any) => {
        console.error('Booking failed:', error);
        this.toastService.showError('Failed to create booking. Please try again.');
      }
    });
  }

  createBookingRequest(): CreateBookingRequest {
    const bookingItems: BookingItem[] = [];
    let totalCount = 0;

    this.ticketTypes.forEach(ticketType => {
      if (ticketType.no_of_tickets && ticketType.no_of_tickets > 0) {
        bookingItems.push({
          offering_id: ticketType.offering_id,
          category_id: ticketType.category_id,
          ticket_type_id: ticketType.type_id,
          quantity: ticketType.no_of_tickets,
          unit_price: ticketType.unit_price
        });
        totalCount += ticketType.no_of_tickets;
      }
    });

    const visitDateStr = this.selectedDate.toISOString().split('T')[0];
    const taxAmount = this.grandTotal * 0.18; // Assuming 18% tax
    const totalWithTax = this.grandTotal + taxAmount;

    return {
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      customerEmail: this.customerEmail || undefined,
      booking_items: bookingItems,
      totalAmount: totalWithTax,
      tax_amount: taxAmount,
      totalCount: totalCount,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID',
      payment_method: this.paymentMethod,
      visitDate: visitDateStr,
      validFrom: visitDateStr,
      validTo: visitDateStr,
      createdBy: 'staff-user' // This should come from authentication
    };
  }

  validateBookingForm(): boolean {
    if (!this.customerName.trim()) {
      this.toastService.showWarn('Customer name is required');
      return false;
    }
    if (!this.customerPhone.trim()) {
      this.toastService.showWarn('Customer phone is required');
      return false;
    }
    if (!this.paymentMethod) {
      this.toastService.showWarn('Please select a payment method');
      return false;
    }
    return true;
  }

  resetBookingForm(): void {
    this.showBookingDialog = false;
    this.customerName = '';
    this.customerEmail = '';
    this.customerPhone = '';
    this.paymentMethod = '';
    this.showPrintButton = false;
    this.lastBookingId = null;
    this.resetAll();
  }

  printTickets(): void {
    if (this.lastBookingId) {
      // Implement print functionality
      console.log('Printing tickets for booking ID:', this.lastBookingId);
      this.toastService.showInfo('Printing tickets...');
      
      // Here you would typically:
      // 1. Get booking details from API
      // 2. Generate PDF or open print dialog
      // 3. Send to printer
      
      // For now, just simulate printing
      setTimeout(() => {
        this.toastService.showSuccess('Tickets printed successfully!');
      }, 2000);
    }
  }

  closeBookingDialog(): void {
    this.showBookingDialog = false;
  }
}
