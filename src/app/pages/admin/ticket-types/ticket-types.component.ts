import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TicketTypesService } from '../../../services/ticket-types.service';
import { CategoriesService } from '../../../services/categories.service';
import { OfferingsService } from '../../../services/offerings.service';
import { ToastService } from '../../../services/toast.service';
import { ConfirmationService } from 'primeng/api';
import { TicketType } from '../../../models/ticket-type.model';
import { Category } from '../../../models/category.model';
import { Offering } from '../../../models/offering.model';

@Component({
  selector: 'app-ticket-types',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, SelectModule, InputNumberModule, ConfirmDialogModule],
  templateUrl: './ticket-types.component.html'
})
export class TicketTypesComponent implements OnInit {
  
  ticketTypes: TicketType[] = [];
  categories: Category[] = [];
  offerings: Offering[] = [];
  displayDialog = false;
  newTicketType: {
    category_id: number | null;
    offering_id: number | null;
    unit_price: number | null;
    extra_price_per_person: number | null;
    is_active: boolean;
  } = {
    category_id: null,
    offering_id: null,
    unit_price: null,
    extra_price_per_person: null,
    is_active: true
  };

  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];
  
  private ticketTypesService = inject(TicketTypesService);
  private categoriesService = inject(CategoriesService);
  private offeringsService = inject(OfferingsService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  ngOnInit() {
    this.loadTicketTypes();
    this.loadCategories();
    this.loadOfferings();
  }

  loadTicketTypes() {
    this.ticketTypesService.getTicketTypes().subscribe({
      next: (data: TicketType[]) => {
        this.ticketTypes = data;
      },
      error: (error: any) => {
        this.toastService.showError('Failed to load ticket types');
      }
    });
  }

  loadCategories() {
    this.categoriesService.getTicketCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
      },
      error: (error: any) => {
        this.toastService.showError('Failed to load categories');
      }
    });
  }

  loadOfferings() {
    this.offeringsService.getOfferings().subscribe({
      next: (data: Offering[]) => {
        this.offerings = data;
      },
      error: (error: any) => {
        this.toastService.showError('Failed to load offerings');
      }
    });
  }

  showAddDialog() {
    this.newTicketType = {
      category_id: null,
      offering_id: null,
      unit_price: null,
      extra_price_per_person: null,
      is_active: true
    };
    this.displayDialog = true;
  }

  saveTicketType() {
    if (!this.newTicketType.category_id || !this.newTicketType.offering_id || 
        this.newTicketType.unit_price === null || this.newTicketType.extra_price_per_person === null) {
      this.toastService.showWarn('Please fill all required fields');
      return;
    }

    const ticketTypeToSave = {
      category_id: this.newTicketType.category_id!,
      offering_id: this.newTicketType.offering_id!,
      unit_price: this.newTicketType.unit_price!,
      extra_price_per_person: this.newTicketType.extra_price_per_person!,
      is_active: this.newTicketType.is_active
    };

    this.ticketTypesService.addTicketType(ticketTypeToSave).subscribe({
      next: (ticketType: TicketType) => {
        this.ticketTypes.push(ticketType);
        this.toastService.showSuccess('Ticket type added successfully');
        this.hideDialog();
      },
      error: (error: any) => {
        this.toastService.showError('Failed to add ticket type');
      }
    });
  }

  hideDialog() {
    this.displayDialog = false;
  }

  deleteTicketType(ticketType: TicketType) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the ticket type for ${ticketType.category_name} - ${ticketType.offering_name}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.ticketTypesService.deleteTicketType(ticketType.type_id).subscribe({
          next: () => {
            this.ticketTypes = this.ticketTypes.filter(t => t.type_id !== ticketType.type_id);
            this.toastService.showSuccess('Ticket type deleted successfully');
          },
          error: (error: any) => {
            this.toastService.showError('Failed to delete ticket type');
          }
        });
      }
    });
  }
}