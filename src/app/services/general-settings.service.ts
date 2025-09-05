import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GeneralSetting } from '../models/general-setting.model';

@Injectable({
  providedIn: 'root'
})
export class GeneralSettingsService {
  private baseUrl = `${environment.apiUrl}/api/v1`;

  constructor(private http: HttpClient) { }

  getSettings(): Observable<GeneralSetting[]> {
    return this.http.get<GeneralSetting[]>(`${this.baseUrl}/settings`);
  }

  addSetting(setting: Partial<GeneralSetting>): Observable<GeneralSetting> {
    return this.http.post<GeneralSetting>(`${this.baseUrl}/settings`, setting);
  }

  updateSetting(id: number, setting: Partial<GeneralSetting>): Observable<GeneralSetting> {
    return this.http.put<GeneralSetting>(`${this.baseUrl}/settings/${id}`, setting);
  }

  deleteSetting(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/settings/${id}`);
  }
}