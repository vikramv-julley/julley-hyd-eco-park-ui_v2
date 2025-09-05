import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { UsersService } from '../../../services/users.service';
import { ToastService } from '../../../services/toast.service';
import { User, UserGroup } from '../../../models/user.model';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, SelectModule, ConfirmDialogModule, TooltipModule],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {

  users: User[] = [];
  displayDialog = false;
  newUser: {
    username: string;
    email: string;
    phone: string;
    tempPassword: string;
    userGroup: UserGroup
  } = {
    username: '',
    email: '',
    phone: '',
    tempPassword: '',
    userGroup: UserGroup.STAFF
  };

  userGroupOptions = [
    { label: 'Admin', value: UserGroup.ADMIN },
    { label: 'Staff', value: UserGroup.STAFF }
  ];

  private usersService = inject(UsersService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.usersService.getUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
      },
      error: (error: any) => {
        this.toastService.showError('Failed to load users');
      }
    });
  }

  showAddDialog() {
    this.newUser = {
      username: '',
      email: '',
      phone: '',
      tempPassword: '',
      userGroup: UserGroup.STAFF
    };
    this.displayDialog = true;
  }

  saveUser() {
    if (!this.newUser.username || !this.newUser.email || !this.newUser.phone) {
      this.toastService.showWarn('Please fill all required fields');
      return;
    }

    if (!this.isValidEmail(this.newUser.email)) {
      this.toastService.showWarn('Please enter a valid email address');
      return;
    }

    const userToCreate: User = {
      username: this.newUser.username,
      email: this.newUser.email,
      phone: this.newUser.phone,
      tempPassword: this.generateTempPassword(),
      userGroup: this.newUser.userGroup
    };

    this.usersService.createUser(userToCreate).subscribe({
      next: (user: User) => {
        this.toastService.showSuccess('User created successfully');
        this.hideDialog();
        this.loadUsers();
      },
      error: (error: any) => {
        this.toastService.showError('Failed to create user');
      }
    });
  }

  deleteUser(user: User) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.usersService.deleteUser(user.phone).subscribe({
          next: () => {
            this.toastService.showSuccess('User deleted successfully');
            this.loadUsers();
          },
          error: (error: any) => {
            this.toastService.showError('Failed to delete user');
          }
        });
      }
    });
  }

  hideDialog() {
    this.displayDialog = false;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private generateTempPassword(): string {
    return Math.random().toString(36).slice(-8);
  }
}
