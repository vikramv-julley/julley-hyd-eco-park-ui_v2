import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TicketTypeDto {
  type_id: number;
  category_id: number;
  category_name: string;  // Changed from categoryName to category_name
  offering_id: number;
  offering_name: string;  // Changed from offeringName to offering_name
  unit_price: number;
  extra_price_per_person?: number;
  create_date?: string;
  is_active: boolean;
  created_by?: string;
}

export interface TicketDto {
  ticketId: number;
  ticketCode: string;
  booking: any;
  ticketType: TicketTypeDto;
  qrCode: string;
  createDate: string;
  isActive: boolean;
  createdBy: string;
}

export interface TicketSearchParams {
  ticketCode?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  bookingId?: number;
}

export interface TicketValidationResult {
  status: 'VALID' | 'EXPIRED' | 'ALREADY_USED' | 'NOT_FOUND' | 'INACTIVE' | 'WRONG_DATE' | 'SYSTEM_ERROR';
  message: string;
  ticketDetails?: TicketDetails;
  canEnter: boolean;
}

export interface TicketDetails {
  ticketId: number;
  ticketCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  visitDate: string;
  categoryName: string;
  offeringName: string;
  ticketPrice: number;
  bookedAt: string;
  used: boolean;
  lastUsedAt?: string;
  bookingId: number;
}

export interface TicketEntryResult {
  success: boolean;
  message: string;
  ticketCode: string;
  entryTime?: string;
  gateNumber?: string;
  staffId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private baseUrl = `${environment.apiUrl}/api/v1/tickets`;

  constructor(private http: HttpClient) { }

  searchTickets(params: TicketSearchParams): Observable<TicketDto[]> {
    let httpParams = new HttpParams();
    
    if (params.ticketCode) {
      httpParams = httpParams.set('ticketCode', params.ticketCode);
    }
    if (params.customerName) {
      httpParams = httpParams.set('customerName', params.customerName);
    }
    if (params.customerEmail) {
      httpParams = httpParams.set('customerEmail', params.customerEmail);
    }
    if (params.customerPhone) {
      httpParams = httpParams.set('customerPhone', params.customerPhone);
    }
    if (params.bookingId) {
      httpParams = httpParams.set('bookingId', params.bookingId.toString());
    }

    return this.http.get<TicketDto[]>(`${this.baseUrl}/search`, { params: httpParams });
  }

  getTicketsByBooking(bookingId: number): Observable<TicketDto[]> {
    return this.http.get<TicketDto[]>(`${this.baseUrl}`, {
      params: { bookingId: bookingId.toString() }
    });
  }

  downloadTicketsPDF(bookingId: number): Observable<Blob> {
    const url = `${this.baseUrl}/booking/${bookingId}/pdf`;
    return this.http.get(url, {
      responseType: 'blob'
    });
  }

  downloadSingleTicketPDF(ticketId: number): Observable<Blob> {
    const url = `${this.baseUrl}/ticket/${ticketId}/pdf`;
    return this.http.get(url, {
      responseType: 'blob'
    });
  }

  validateTicket(ticketCode: string, staffId?: string): Observable<TicketValidationResult> {
    let httpParams = new HttpParams();
    if (staffId) {
      httpParams = httpParams.set('staffId', staffId);
    }
    
    return this.http.post<TicketValidationResult>(`${this.baseUrl}/validate/${ticketCode}`, {}, {
      params: httpParams
    });
  }

  recordEntry(ticketCode: string, gateNumber?: string, staffId?: string): Observable<TicketEntryResult> {
    let httpParams = new HttpParams();
    if (gateNumber) {
      httpParams = httpParams.set('gateNumber', gateNumber);
    }
    if (staffId) {
      httpParams = httpParams.set('staffId', staffId);
    }
    
    return this.http.post<TicketEntryResult>(`${this.baseUrl}/entry/${ticketCode}`, {}, {
      params: httpParams
    });
  }
}