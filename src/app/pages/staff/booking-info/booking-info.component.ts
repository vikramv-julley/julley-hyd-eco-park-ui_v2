import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TicketService, TicketDto, TicketSearchParams } from '../../../services/ticket.service';
import { ToastService } from '../../../services/toast.service';

// Interface for grouped booking data
export interface BookingGroup {
  bookingId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  visitDate: string;
  totalTickets: number;
  ticketTypeSummary: string;
  status: boolean;
  tickets: TicketDto[];
  totalAmount?: number;
  paymentStatus?: string;
}

@Component({
  selector: 'app-booking-info',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    TagModule,
    TooltipModule,
    DialogModule,
    ProgressSpinnerModule,
    AutoCompleteModule
  ],
  templateUrl: './booking-info.component.html'
})
export class BookingInfoComponent implements OnInit {
  tickets: TicketDto[] = [];
  bookingGroups: BookingGroup[] = [];  // New: grouped bookings
  loading: boolean = false;
  searchParams: TicketSearchParams = {};
  selectedTicket: TicketDto | null = null;
  selectedBookingTickets: TicketDto[] = [];
  showTicketDialog: boolean = false;
  showBookingDialog: boolean = false;
  downloadingTicket: boolean = false;
  downloadingBooking: boolean = false;
  loadingBookingTickets: boolean = false;
  
  // Unified search
  searchQuery: string = '';
  filteredSuggestions: any[] = [];
  allTickets: TicketDto[] = [];

  constructor(
    private ticketService: TicketService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadRecentTickets();
    this.loadAllTicketsForSearch();
  }

  loadRecentTickets() {
    this.loading = true;
    // Load recent tickets (no search params)
    this.ticketService.searchTickets({}).subscribe({
      next: (data) => {
        this.tickets = data;
        this.bookingGroups = this.groupTicketsByBooking(data);
        this.loading = false;
      },
      error: (error) => {
        this.toastService.showError('Failed to load tickets');
        this.loading = false;
      }
    });
  }
  
  loadAllTicketsForSearch() {
    // Load all tickets for search suggestions (cached)
    this.ticketService.searchTickets({}).subscribe({
      next: (data) => {
        this.allTickets = data;
      },
      error: (error) => {
        console.error('Failed to load tickets for search', error);
      }
    });
  }

  searchTickets() {
    if (!this.hasSearchCriteria()) {
      this.toastService.showWarn('Please enter at least one search criterion');
      return;
    }

    this.loading = true;
    this.ticketService.searchTickets(this.searchParams).subscribe({
      next: (data) => {
        this.tickets = data;
        this.bookingGroups = this.groupTicketsByBooking(data);
        this.loading = false;
        if (data.length === 0) {
          this.toastService.showInfo('No tickets found matching your search criteria');
        }
      },
      error: (error) => {
        this.toastService.showError('Failed to search tickets');
        this.loading = false;
      }
    });
  }

  clearSearch() {
    this.searchParams = {};
    this.loadRecentTickets();
  }

  hasSearchCriteria(): boolean {
    return !!(this.searchParams.ticketCode || 
              this.searchParams.customerName || 
              this.searchParams.customerEmail || 
              this.searchParams.customerPhone || 
              this.searchParams.bookingId);
  }

  viewTicketDetails(ticket: TicketDto) {
    this.selectedTicket = ticket;
    this.showTicketDialog = true;
  }

  viewBookingTickets(ticket: TicketDto) {
    if (!ticket.booking?.bookingId) {
      this.toastService.showWarn('No booking information available');
      return;
    }

    this.loadingBookingTickets = true;
    this.ticketService.getTicketsByBooking(ticket.booking.bookingId).subscribe({
      next: (tickets) => {
        console.log('Loaded tickets:', tickets); // Debug log
        this.selectedBookingTickets = tickets;
        
        // Log first ticket details for debugging
        if (tickets.length > 0) {
          console.log('First ticket full structure:', tickets[0]);
          console.log('Ticket type structure:', tickets[0].ticketType);
          if (tickets[0].ticketType) {
            console.log('Category:', tickets[0].ticketType.category_name);
            console.log('Offering:', tickets[0].ticketType.offering_name);
          }
        }
        
        this.showBookingDialog = true;
        this.loadingBookingTickets = false;
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
        this.toastService.showError('Failed to load booking tickets');
        this.loadingBookingTickets = false;
      }
    });
  }

  downloadSingleTicket(ticket: TicketDto) {
    this.downloadingTicket = true;
    this.ticketService.downloadSingleTicketPDF(ticket.ticketId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ticket-${ticket.ticketCode}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.downloadingTicket = false;
        this.toastService.showSuccess('Ticket downloaded successfully');
      },
      error: (error) => {
        this.toastService.showError('Failed to download ticket');
        this.downloadingTicket = false;
      }
    });
  }

  downloadBookingTickets(bookingId: number) {
    this.downloadingBooking = true;
    this.ticketService.downloadTicketsPDF(bookingId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `booking-${bookingId}-tickets.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.downloadingBooking = false;
        this.toastService.showSuccess('All tickets downloaded successfully');
      },
      error: (error) => {
        this.toastService.showError('Failed to download tickets');
        this.downloadingBooking = false;
      }
    });
  }

  getTicketTypeDisplay(ticket: TicketDto): string {
    if (ticket.ticketType) {
      const category = ticket.ticketType.category_name || '';
      const offering = ticket.ticketType.offering_name || '';
      
      if (category && offering) {
        return `${category} - ${offering}`;
      } else if (category) {
        return category;
      } else if (offering) {
        return offering;
      }
    }
    return 'N/A';
  }

  getStatusSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  searchSuggestions(event: any) {
    const query = event.query.toLowerCase();
    this.filteredSuggestions = this.allTickets.filter(ticket => {
      return (
        ticket.ticketCode?.toLowerCase().includes(query) ||
        ticket.booking?.name?.toLowerCase().includes(query) ||
        ticket.booking?.email?.toLowerCase().includes(query) ||
        ticket.booking?.mobile?.toLowerCase().includes(query) ||
        ticket.booking?.bookingId?.toString().includes(query)
      );
    }).map(ticket => ({
      label: `${ticket.ticketCode} - ${ticket.booking?.name || 'N/A'} (${ticket.booking?.bookingId || 'N/A'})`,
      value: ticket.ticketCode,
      ticket: ticket
    })).slice(0, 10); // Limit to 10 suggestions
  }
  
  onSelectSuggestion(event: any) {
    if (event.ticket) {
      this.tickets = [event.ticket];
    }
  }
  
  performUnifiedSearch() {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.loadRecentTickets();
      return;
    }
    
    const query = this.searchQuery.toLowerCase();
    this.loading = true;
    
    // Search across all fields
    const searchParams: TicketSearchParams = {};
    
    // Check if it's a number (could be booking ID)
    if (!isNaN(Number(query))) {
      searchParams.bookingId = Number(query);
    } else if (query.includes('@')) {
      searchParams.customerEmail = this.searchQuery;
    } else if (query.match(/^[0-9]{10}$/)) {
      searchParams.customerPhone = this.searchQuery;
    } else if (query.startsWith('tkt') || query.startsWith('TKT')) {
      searchParams.ticketCode = this.searchQuery;
    } else {
      searchParams.customerName = this.searchQuery;
    }
    
    this.ticketService.searchTickets(searchParams).subscribe({
      next: (data) => {
        this.tickets = data;
        this.bookingGroups = this.groupTicketsByBooking(data);
        this.loading = false;
        if (data.length === 0) {
          // Try a broader search
          this.performBroadSearch(this.searchQuery);
        }
      },
      error: (error) => {
        this.toastService.showError('Failed to search tickets');
        this.loading = false;
      }
    });
  }
  
  performBroadSearch(query: string) {
    // Filter from all loaded tickets
    const lowerQuery = query.toLowerCase();
    this.tickets = this.allTickets.filter(ticket => {
      return (
        ticket.ticketCode?.toLowerCase().includes(lowerQuery) ||
        ticket.booking?.name?.toLowerCase().includes(lowerQuery) ||
        ticket.booking?.email?.toLowerCase().includes(lowerQuery) ||
        ticket.booking?.mobile?.toLowerCase().includes(lowerQuery) ||
        ticket.booking?.bookingId?.toString().includes(lowerQuery) ||
        ticket.ticketType?.category_name?.toLowerCase().includes(lowerQuery) ||
        ticket.ticketType?.offering_name?.toLowerCase().includes(lowerQuery)
      );
    });
    
    this.bookingGroups = this.groupTicketsByBooking(this.tickets);
    
    if (this.tickets.length === 0) {
      this.toastService.showInfo('No tickets found matching your search');
    }
  }
  
  clearUnifiedSearch() {
    this.searchQuery = '';
    this.loadRecentTickets();
  }
  
  // Group tickets by booking ID
  groupTicketsByBooking(tickets: TicketDto[]): BookingGroup[] {
    const bookingMap = new Map<number, BookingGroup>();
    
    tickets.forEach(ticket => {
      const bookingId = ticket.booking?.bookingId;
      if (!bookingId) return;
      
      if (!bookingMap.has(bookingId)) {
        // Create new booking group
        bookingMap.set(bookingId, {
          bookingId: bookingId,
          customerName: ticket.booking?.name || 'N/A',
          customerEmail: ticket.booking?.email || 'N/A',
          customerPhone: ticket.booking?.mobile || 'N/A',
          visitDate: ticket.booking?.visitDate || 'N/A',
          totalTickets: 0,
          ticketTypeSummary: '',
          status: ticket.isActive,
          tickets: [],
          totalAmount: ticket.booking?.totalAmount,
          paymentStatus: ticket.booking?.paymentStatus
        });
      }
      
      const group = bookingMap.get(bookingId)!;
      group.tickets.push(ticket);
      group.totalTickets = group.tickets.length;
      
      // Update ticket type summary
      const typeCounts = new Map<string, number>();
      group.tickets.forEach(t => {
        const type = t.ticketType?.category_name || 'Unknown';
        typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
      });
      
      group.ticketTypeSummary = Array.from(typeCounts.entries())
        .map(([type, count]) => count > 1 ? `${count}x ${type}` : type)
        .join(', ');
    });
    
    // Convert map to array and sort by booking ID descending
    return Array.from(bookingMap.values()).sort((a, b) => b.bookingId - a.bookingId);
  }
  
  // View all tickets for a booking group
  viewBookingGroupTickets(bookingGroup: BookingGroup) {
    this.selectedBookingTickets = bookingGroup.tickets;
    this.showBookingDialog = true;
  }
}