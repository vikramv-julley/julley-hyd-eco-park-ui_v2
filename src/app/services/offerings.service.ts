import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Offering } from '../models/offering.model';

@Injectable({
  providedIn: 'root'
})
export class OfferingsService {
  private baseUrl = `${environment.apiUrl}/api/v1`;

  constructor(private http: HttpClient) { }

  getOfferings(): Observable<Offering[]> {
    return this.http.get<Offering[]>(`${this.baseUrl}/offerings`);
  }

  addOffering(offering: Partial<Offering>): Observable<Offering> {
    return this.http.post<Offering>(`${this.baseUrl}/offerings`, offering);
  }

  updateOffering(id: number, offering: Partial<Offering>): Observable<Offering> {
    return this.http.put<Offering>(`${this.baseUrl}/offerings/${id}`, offering);
  }

  deleteOffering(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/offerings/${id}`);
  }
}