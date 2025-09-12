import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateBookingRequest, BookingInfo } from '../models/booking-info.model';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  private baseUrl = `${environment.apiUrl}/api/v1`;

  constructor(private http: HttpClient) { }

  createBooking(booking: CreateBookingRequest): Observable<BookingInfo> {
    return this.http.post<BookingInfo>(`${this.baseUrl}/bookings`, booking);
  }

  getBookings(): Observable<BookingInfo[]> {
    return this.http.get<BookingInfo[]>(`${this.baseUrl}/bookings`);
  }

  getBookingById(id: number): Observable<BookingInfo> {
    return this.http.get<BookingInfo>(`${this.baseUrl}/bookings/${id}`);
  }

  downloadTickets(bookingId: number): Observable<Blob> {
    const url = `${this.baseUrl}/tickets/booking/${bookingId}/pdf`;
    console.log('Making request to:', url);
    return this.http.get(url, {
      responseType: 'blob'
    });
  }

  rescheduleBooking(bookingId: number, newVisitDate: string): Observable<any> {
    const request = {
      newVisitDate: newVisitDate,
      updatedBy: 'STAFF'
    };
    return this.http.patch<any>(`${this.baseUrl}/bookings/${bookingId}/reschedule`, request);
  }
}