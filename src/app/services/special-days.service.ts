import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SpecialDay, CreateSpecialDayRequest, UpdateSpecialDayRequest } from '../models/special-day.model';

@Injectable({
  providedIn: 'root'
})
export class SpecialDaysService {
  private baseUrl = `${environment.apiUrl}/api/v1`;

  constructor(private http: HttpClient) { }

  getSpecialDays(): Observable<SpecialDay[]> {
    return this.http.get<SpecialDay[]>(`${this.baseUrl}/special-days`);
  }

  getSpecialDayByDate(date: string): Observable<SpecialDay> {
    return this.http.get<SpecialDay>(`${this.baseUrl}/special-days/${date}`);
  }

  createSpecialDay(specialDay: CreateSpecialDayRequest): Observable<SpecialDay> {
    return this.http.post<SpecialDay>(`${this.baseUrl}/special-days`, specialDay);
  }

  updateSpecialDay(date: string, specialDay: UpdateSpecialDayRequest): Observable<SpecialDay> {
    return this.http.put<SpecialDay>(`${this.baseUrl}/special-days/${date}`, specialDay);
  }

  toggleSpecialDayStatus(date: string): Observable<SpecialDay> {
    return this.http.patch<SpecialDay>(`${this.baseUrl}/special-days/${date}/toggle-status`, {});
  }

  deleteSpecialDay(date: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/special-days/${date}`);
  }
}