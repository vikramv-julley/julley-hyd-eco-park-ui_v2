import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { CategoriesService } from '../../../services/categories.service';
import { ToastService } from '../../../services/toast.service';
import { Category } from '../../../models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [DatePipe, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, TextareaModule, SelectModule, InputNumberModule, ConfirmDialogModule],
  templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit {
  
  categories: Category[] = [];
  displayDialog = false;
  newCategory: { 
    name: string; 
    description: string; 
    extra_persons_allowed: boolean; 
    no_of_people_allowed: number | null;
    is_active: boolean 
  } = { 
    name: '', 
    description: '', 
    extra_persons_allowed: false, 
    no_of_people_allowed: null,
    is_active: true 
  };
  isEditMode = false;
  selectedCategoryId: number | null = null;

  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  extraPersonsOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];
  
  private categoriesService = inject(CategoriesService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  ngOnInit() {
    this.loadTicketCategories();
  }

  loadTicketCategories() {
    this.categoriesService.getTicketCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
      },
      error: (error: any) => {
        this.toastService.showError('Failed to load categories');
      }
    });
  }

  showAddDialog() {
    this.newCategory = { 
      name: '', 
      description: '', 
      extra_persons_allowed: false, 
      no_of_people_allowed: null,
      is_active: true 
    };
    this.isEditMode = false;
    this.selectedCategoryId = null;
    this.displayDialog = true;
  }

  showEditDialog(category: Category) {
    this.newCategory = { 
      name: category.name, 
      description: category.description, 
      extra_persons_allowed: category.extra_persons_allowed, 
      no_of_people_allowed: category.no_of_people_allowed,
      is_active: category.is_active 
    };
    this.isEditMode = true;
    this.selectedCategoryId = category.category_id;
    this.displayDialog = true;
  }

  saveCategory() {
    if (!this.newCategory.name || !this.newCategory.description) {
      this.toastService.showWarn('Please fill all required fields');
      return;
    }

    if (this.isEditMode && this.selectedCategoryId) {
      this.categoriesService.updateCategory(this.selectedCategoryId, this.newCategory).subscribe({
        next: (updatedCategory: Category) => {
          const index = this.categories.findIndex(c => c.category_id === this.selectedCategoryId);
          if (index !== -1) {
            this.categories[index] = updatedCategory;
          }
          this.toastService.showSuccess('Category updated successfully');
          this.hideDialog();
        },
        error: (error: any) => {
          this.toastService.showError('Failed to update category');
        }
      });
    } else {
      this.categoriesService.addCategory(this.newCategory).subscribe({
        next: (category: Category) => {
          this.categories.push(category);
          this.toastService.showSuccess('Category added successfully');
          this.hideDialog();
        },
        error: (error: any) => {
          this.toastService.showError('Failed to add category');
        }
      });
    }
  }

  deleteCategory(category: Category) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${category.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.categoriesService.deleteCategory(category.category_id).subscribe({
          next: () => {
            this.categories = this.categories.filter(c => c.category_id !== category.category_id);
            this.toastService.showSuccess('Category deleted successfully');
          },
          error: (error: any) => {
            this.toastService.showError('Failed to delete category');
          }
        });
      }
    });
  }

  hideDialog() {
    this.displayDialog = false;
  }
}