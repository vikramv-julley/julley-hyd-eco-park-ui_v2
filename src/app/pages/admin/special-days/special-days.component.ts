import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { SpecialDaysService } from '../../../services/special-days.service';
import { ToastService } from '../../../services/toast.service';
import { SpecialDay, CreateSpecialDayRequest, UpdateSpecialDayRequest } from '../../../models/special-day.model';

@Component({
  selector: 'app-special-days',
  standalone: true,
  imports: [
    FormsModule, 
    TableModule, 
    ButtonModule, 
    DialogModule, 
    InputTextModule, 
    TextareaModule, 
    ConfirmDialogModule, 
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    TagModule,
    TooltipModule
  ],
  templateUrl: './special-days.component.html'
})
export class SpecialDaysComponent implements OnInit {
  
  specialDays: SpecialDay[] = [];
  displayDialog = false;
  newSpecialDay: {
    date: Date | null;
    name: string;
    description: string;
    price_modifier: number;
  } = {
    date: null,
    name: '',
    description: '',
    price_modifier: 1.0
  };
  isEditMode = false;
  selectedDate: string | null = null;

  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];
  
  private specialDaysService = inject(SpecialDaysService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  ngOnInit() {
    this.loadSpecialDays();
  }

  loadSpecialDays() {
    this.specialDaysService.getSpecialDays().subscribe({
      next: (data: SpecialDay[]) => {
        this.specialDays = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      },
      error: (error: any) => {
        this.toastService.showError('Failed to load special days');
        console.error('Error loading special days:', error);
      }
    });
  }

  showAddDialog() {
    this.newSpecialDay = {
      date: null,
      name: '',
      description: '',
      price_modifier: 1.0
    };
    this.isEditMode = false;
    this.selectedDate = null;
    this.displayDialog = true;
  }

  showEditDialog(specialDay: SpecialDay) {
    this.newSpecialDay = {
      date: new Date(specialDay.date),
      name: specialDay.name,
      description: specialDay.description || '',
      price_modifier: specialDay.price_modifier
    };
    this.isEditMode = true;
    this.selectedDate = specialDay.date;
    this.displayDialog = true;
  }

  saveSpecialDay() {
    if (!this.newSpecialDay.date || !this.newSpecialDay.name || this.newSpecialDay.price_modifier === null) {
      this.toastService.showWarn('Please fill all required fields');
      return;
    }

    const dateString = this.formatDate(this.newSpecialDay.date);

    if (this.isEditMode && this.selectedDate) {
      const updateRequest: UpdateSpecialDayRequest = {
        name: this.newSpecialDay.name,
        description: this.newSpecialDay.description,
        price_modifier: this.newSpecialDay.price_modifier
      };

      this.specialDaysService.updateSpecialDay(this.selectedDate, updateRequest).subscribe({
        next: (updatedSpecialDay: SpecialDay) => {
          const index = this.specialDays.findIndex(sd => sd.date === this.selectedDate);
          if (index !== -1) {
            this.specialDays[index] = updatedSpecialDay;
          }
          this.toastService.showSuccess('Special day updated successfully');
          this.hideDialog();
        },
        error: (error: any) => {
          this.toastService.showError('Failed to update special day');
          console.error('Error updating special day:', error);
        }
      });
    } else {
      const createRequest: CreateSpecialDayRequest = {
        date: dateString,
        name: this.newSpecialDay.name,
        description: this.newSpecialDay.description,
        price_modifier: this.newSpecialDay.price_modifier
      };

      this.specialDaysService.createSpecialDay(createRequest).subscribe({
        next: (specialDay: SpecialDay) => {
          this.specialDays.push(specialDay);
          this.specialDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          this.toastService.showSuccess('Special day created successfully');
          this.hideDialog();
        },
        error: (error: any) => {
          this.toastService.showError('Failed to create special day');
          console.error('Error creating special day:', error);
        }
      });
    }
  }

  hideDialog() {
    this.displayDialog = false;
  }

  toggleStatus(specialDay: SpecialDay) {
    this.specialDaysService.toggleSpecialDayStatus(specialDay.date).subscribe({
      next: (updatedSpecialDay: SpecialDay) => {
        const index = this.specialDays.findIndex(sd => sd.date === specialDay.date);
        if (index !== -1) {
          this.specialDays[index] = updatedSpecialDay;
        }
        this.toastService.showSuccess('Special day status updated successfully');
      },
      error: (error: any) => {
        this.toastService.showError('Failed to update special day status');
        console.error('Error updating status:', error);
      }
    });
  }

  deleteSpecialDay(specialDay: SpecialDay) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${specialDay.name}" on ${this.formatDisplayDate(specialDay.date)}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.specialDaysService.deleteSpecialDay(specialDay.date).subscribe({
          next: () => {
            this.specialDays = this.specialDays.filter(sd => sd.date !== specialDay.date);
            this.toastService.showSuccess('Special day deleted successfully');
          },
          error: (error: any) => {
            this.toastService.showError('Failed to delete special day');
            console.error('Error deleting special day:', error);
          }
        });
      }
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDisplayDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-GB');
  }

  getDateStatus(dateString: string): 'past' | 'today' | 'future' {
    const today = new Date();
    const date = new Date(dateString);
    const todayString = today.toISOString().split('T')[0];
    const compareDateString = date.toISOString().split('T')[0];
    
    if (compareDateString < todayString) return 'past';
    if (compareDateString === todayString) return 'today';
    return 'future';
  }

  getStatusTagSeverity(status: boolean): 'success' | 'danger' {
    return status ? 'success' : 'danger';
  }

  getDateTagSeverity(dateString: string): 'secondary' | 'success' | 'info' {
    const status = this.getDateStatus(dateString);
    switch (status) {
      case 'past': return 'secondary';
      case 'today': return 'success';
      case 'future': return 'info';
    }
  }

  getPriceModifierDisplay(modifier: number): string {
    const percentage = ((modifier - 1) * 100);
    if (percentage > 0) return `+${percentage.toFixed(0)}%`;
    if (percentage < 0) return `${percentage.toFixed(0)}%`;
    return 'No change';
  }

  getPriceModifierSeverity(modifier: number): 'success' | 'danger' | 'secondary' {
    if (modifier > 1) return 'danger';
    if (modifier < 1) return 'success';
    return 'secondary';
  }
}