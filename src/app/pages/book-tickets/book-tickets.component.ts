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
import { OfferingsService } from '../../services/offerings.service';
import { TicketTypesService } from '../../services/ticket-types.service';
import { ToastService } from '../../services/toast.service';
import { BookingsService } from '../../services/bookings.service';
import { PaymentService } from '../../services/payment.service';
import { OrderRequest, PaymentVerificationRequest } from '../../models/payment.model';
import { Offering } from '../../models/offering.model';
import { TicketType } from '../../models/ticket-type.model';
import { BookingInfo, BookingItem, CreateBookingRequest } from '../../models/booking-info.model';

@Component({
  selector: 'app-book-tickets',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, DatePickerModule, MultiSelectModule, ButtonModule, PanelModule, InputNumberModule, InputTextModule, RadioButtonModule, DialogModule],
  templateUrl: './book-tickets.component.html'
})
export class BookTicketsComponent implements OnInit {

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
  isProcessingPayment: boolean = false;
  showPrintButton: boolean = false;
  lastBookingId: number | null = null;

  private offeringsService = inject(OfferingsService);
  private ticketTypesService = inject(TicketTypesService);
  private toastService = inject(ToastService);
  private bookingsService = inject(BookingsService);
  private paymentService = inject(PaymentService);

  ngOnInit() {
    console.log('BookTicketsComponent initialized');
    this.loadOfferings();
    this.loadRazorpayScript();
  }

  async loadRazorpayScript() {
    const loaded = await this.paymentService.loadRazorpayScript();
    if (!loaded) {
      this.toastService.showError('Failed to load payment gateway. Please refresh the page.');
    }
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
    this.selectedOfferings = [];
    this.ticketTypes = [];
    this.showTicketSelection = false;
    this.grandTotal = 0;
    this.selectedDate = new Date();
  }

  onBookTickets(): void {
    if (this.grandTotal === 0) {
      this.toastService.showWarn('Please select at least one ticket');
      return;
    }
    console.log('Opening booking dialog');
    this.showBookingDialog = true;
  }

  async confirmBooking(): Promise<void> {
    if (!this.validateBookingForm()) {
      return;
    }
    
    
    this.isProcessingPayment = true;
    
    try {
      // Create Razorpay order first
      const orderRequest: OrderRequest = {
        amount: this.grandTotal,
        currency: 'INR',
        receipt: `booking_${Date.now()}`,
        notes: 'Ticket booking payment',
        customerId: this.customerPhone,
        customerEmail: this.customerEmail,
        customerPhone: this.customerPhone
      };
      
      const paymentResponse = await this.paymentService.createOrder(orderRequest).toPromise();
      
      if (!paymentResponse?.success) {
        throw new Error(paymentResponse?.message || 'Failed to create payment order');
      }
      
      // Initiate Razorpay payment
      const paymentResult = await this.paymentService.initiatePayment(paymentResponse, {
        customerName: this.customerName,
        customerEmail: this.customerEmail,
        customerPhone: this.customerPhone
      });
      
      // Verify payment before creating booking
      const verificationRequest: PaymentVerificationRequest = {
        razorpay_order_id: paymentResult.razorpay_order_id,
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_signature: paymentResult.razorpay_signature
      };
      
      this.paymentService.verifyPayment(verificationRequest).subscribe({
        next: (verificationResponse: any) => {
          if (verificationResponse.success) {
            // Payment verified successfully, now create booking
            const bookingRequest = this.createBookingRequest();
            bookingRequest.payment_method = 'razorpay';
            bookingRequest.razorpay_payment_id = paymentResult.razorpay_payment_id;
            bookingRequest.razorpay_order_id = paymentResult.razorpay_order_id;
            
            this.bookingsService.createBooking(bookingRequest).subscribe({
              next: (response: any) => {
                this.lastBookingId = response.bookingId || response.id || response.booking_id;
                this.showPrintButton = true;
                this.toastService.showSuccess('Payment verified and booking confirmed!');
                this.showBookingDialog = false;
                this.isProcessingPayment = false;
              },
              error: (error: any) => {
                console.error('Booking creation failed after payment verification:', error);
                this.toastService.showError('Payment verified but booking failed. Please contact support.');
                this.isProcessingPayment = false;
              }
            });
          } else {
            this.toastService.showError('Payment verification failed. Please contact support.');
            this.isProcessingPayment = false;
          }
        },
        error: (error: any) => {
          console.error('Payment verification failed:', error);
          this.toastService.showError('Payment verification failed. Please try again or contact support.');
          this.isProcessingPayment = false;
        }
      });
      
    } catch (error: any) {
      console.error('Payment failed:', error);
      this.toastService.showError(error.message || 'Payment failed. Please try again.');
      this.isProcessingPayment = false;
    }
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
      payment_method: 'razorpay',
      razorpay_payment_id: '',
      razorpay_order_id: '',
      visitDate: visitDateStr,
      validFrom: visitDateStr,
      validTo: visitDateStr,
      createdBy: 'online-customer'
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
    return true;
  }

  resetBookingForm(): void {
    this.showBookingDialog = false;
    this.customerName = '';
    this.customerEmail = '';
    this.customerPhone = '';
    this.isProcessingPayment = false;
    this.showPrintButton = false;
    this.lastBookingId = null;
    this.resetAll();
  }

  downloadTickets(): void {
    if (this.lastBookingId) {
      console.log('Attempting to download tickets for booking ID:', this.lastBookingId);
      this.toastService.showInfo('Downloading tickets...');
      
      this.bookingsService.downloadTickets(this.lastBookingId).subscribe({
        next: (blob: Blob) => {
          console.log('Download successful, blob size:', blob.size);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `tickets_booking_${this.lastBookingId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          this.toastService.showSuccess('Tickets downloaded successfully!');
        },
        error: (error: any) => {
          console.error('Download failed:', error);
          this.toastService.showError('Failed to download tickets. Please try again.');
        }
      });
    } else {
      console.error('No booking ID available for download');
      this.toastService.showError('No booking ID available for download');
    }
  }

  printTickets(): void {
    if (this.lastBookingId) {
      console.log('Printing tickets for booking ID:', this.lastBookingId);
      this.toastService.showInfo('Printing tickets...');
      
      setTimeout(() => {
        this.toastService.showSuccess('Tickets printed successfully!');
      }, 2000);
    }
  }

  closeBookingDialog(): void {
    this.showBookingDialog = false;
  }

}
