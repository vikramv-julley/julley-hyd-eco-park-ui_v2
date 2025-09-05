import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { ConfirmationService } from 'primeng/api';
import { OfferingsService } from '../../../services/offerings.service';
import { ToastService } from '../../../services/toast.service';
import { Offering } from '../../../models/offering.model';

@Component({
  selector: 'app-offerings',
  standalone: true,
  imports: [DatePipe, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, TextareaModule, ConfirmDialogModule, SelectModule],
  templateUrl: './offerings.component.html'
})
export class OfferingsComponent implements OnInit {
  
  offerings: Offering[] = [];
  displayDialog = false;
  newOffering: { name: string; description: string; is_active: boolean } = { 
    name: '', 
    description: '', 
    is_active: true 
  };
  isEditMode = false;
  selectedOfferingId: number | null = null;

  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];
  
  private offeringsService = inject(OfferingsService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  ngOnInit() {
    this.loadOfferings();
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
    this.newOffering = { name: '', description: '', is_active: true };
    this.isEditMode = false;
    this.selectedOfferingId = null;
    this.displayDialog = true;
  }

  showEditDialog(offering: Offering) {
    this.newOffering = { name: offering.name, description: offering.description, is_active: offering.is_active };
    this.isEditMode = true;
    this.selectedOfferingId = offering.offering_id;
    this.displayDialog = true;
  }

  saveOffering() {
    if (!this.newOffering.name || !this.newOffering.description) {
      this.toastService.showWarn('Please fill all required fields');
      return;
    }

    console.log('Saving offering:', this.newOffering);
    console.log('is_active value:', this.newOffering.is_active, 'type:', typeof this.newOffering.is_active);

    if (this.isEditMode && this.selectedOfferingId) {
      this.offeringsService.updateOffering(this.selectedOfferingId, this.newOffering).subscribe({
        next: (updatedOffering: Offering) => {
          const index = this.offerings.findIndex(o => o.offering_id === this.selectedOfferingId);
          if (index !== -1) {
            this.offerings[index] = updatedOffering;
          }
          this.toastService.showSuccess('Offering updated successfully');
          this.hideDialog();
        },
        error: (error: any) => {
          this.toastService.showError('Failed to update offering');
        }
      });
    } else {
      this.offeringsService.addOffering(this.newOffering).subscribe({
        next: (offering: Offering) => {
          this.offerings.push(offering);
          this.toastService.showSuccess('Offering added successfully');
          this.hideDialog();
        },
        error: (error: any) => {
          this.toastService.showError('Failed to add offering');
        }
      });
    }
  }

  hideDialog() {
    this.displayDialog = false;
  }

  deleteOffering(offering: Offering) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${offering.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.offeringsService.deleteOffering(offering.offering_id).subscribe({
          next: () => {
            this.offerings = this.offerings.filter(o => o.offering_id !== offering.offering_id);
            this.toastService.showSuccess('Offering deleted successfully');
          },
          error: (error: any) => {
            this.toastService.showError('Failed to delete offering');
          }
        });
      }
    });
  }
}