import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TicketType } from '../models/ticket-type.model';

@Injectable({
  providedIn: 'root'
})
export class TicketTypesService {
  private baseUrl = `${environment.apiUrl}/api/v1`;

  constructor(private http: HttpClient) { }

  getTicketTypes(): Observable<TicketType[]> {
    return this.http.get<TicketType[]>(`${this.baseUrl}/ticket-types`);
  }

  addTicketType(ticketType: Partial<TicketType>): Observable<TicketType> {
    return this.http.post<TicketType>(`${this.baseUrl}/ticket-types`, ticketType);
  }

  deleteTicketType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/ticket-types/${id}`);
  }

  getActiveTicketTypesByOfferings(offeringIds: number[]): Observable<TicketType[]> {
    const params = { offeringIds: offeringIds.join(',') };
    return this.http.get<TicketType[]>(`${this.baseUrl}/ticket-types/active/by-offerings`, { params });
  }
}