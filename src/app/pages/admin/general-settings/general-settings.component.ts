import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { GeneralSettingsService } from '../../../services/general-settings.service';
import { ToastService } from '../../../services/toast.service';
import { GeneralSetting } from '../../../models/general-setting.model';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [DatePipe, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, TextareaModule, SelectModule, ConfirmDialogModule],
  templateUrl: './general-settings.component.html'
})
export class GeneralSettingsComponent implements OnInit {
  
  settings: GeneralSetting[] = [];
  displayDialog = false;
  editMode = false;
  selectedSetting: GeneralSetting | null = null;
  newSetting: {
    settingKey: string;
    displayName: string;
    settingValue: string;
    description: string;
    settingsCategory: string;
    isActive: boolean;
  } = {
    settingKey: '',
    displayName: '',
    settingValue: '',
    description: '',
    settingsCategory: '',
    isActive: true
  };

  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  categoryOptions = [
    { label: 'General', value: 'GENERAL' },
    { label: 'Admin', value: 'ADMIN' }
  ];
  
  private generalSettingsService = inject(GeneralSettingsService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.generalSettingsService.getSettings().subscribe({
      next: (data: GeneralSetting[]) => {
        this.settings = data;
      },
      error: (error: any) => {
        this.toastService.showError('Failed to load settings');
      }
    });
  }

  showAddDialog() {
    this.editMode = false;
    this.selectedSetting = null;
    this.newSetting = {
      settingKey: '',
      displayName: '',
      settingValue: '',
      description: '',
      settingsCategory: '',
      isActive: true
    };
    this.displayDialog = true;
  }

  showEditDialog(setting: GeneralSetting) {
    this.editMode = true;
    this.selectedSetting = setting;
    this.newSetting = {
      settingKey: setting.settingKey,
      displayName: setting.displayName,
      settingValue: setting.settingValue,
      description: setting.description,
      settingsCategory: setting.settingsCategory,
      isActive: setting.isActive
    };
    this.displayDialog = true;
  }

  saveSetting() {
    if (!this.newSetting.settingKey || !this.newSetting.displayName || 
        !this.newSetting.settingValue || !this.newSetting.settingsCategory) {
      this.toastService.showWarn('Please fill all required fields');
      return;
    }

    if (this.editMode && this.selectedSetting) {
      this.generalSettingsService.updateSetting(this.selectedSetting.settingId, this.newSetting).subscribe({
        next: (setting: GeneralSetting) => {
          const index = this.settings.findIndex(s => s.settingId === setting.settingId);
          if (index !== -1) {
            this.settings[index] = setting;
          }
          this.toastService.showSuccess('Setting updated successfully');
          this.hideDialog();
        },
        error: (error: any) => {
          this.toastService.showError('Failed to update setting');
        }
      });
    } else {
      this.generalSettingsService.addSetting(this.newSetting).subscribe({
        next: (setting: GeneralSetting) => {
          this.settings.push(setting);
          this.toastService.showSuccess('Setting added successfully');
          this.hideDialog();
        },
        error: (error: any) => {
          this.toastService.showError('Failed to add setting');
        }
      });
    }
  }

  deleteSetting(setting: GeneralSetting) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the setting "${setting.displayName}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.generalSettingsService.deleteSetting(setting.settingId).subscribe({
          next: () => {
            this.settings = this.settings.filter(s => s.settingId !== setting.settingId);
            this.toastService.showSuccess('Setting deleted successfully');
          },
          error: (error: any) => {
            this.toastService.showError('Failed to delete setting');
          }
        });
      }
    });
  }

  hideDialog() {
    this.displayDialog = false;
    this.editMode = false;
    this.selectedSetting = null;
  }
}