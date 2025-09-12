import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZXingScannerModule, ZXingScannerComponent } from '@zxing/ngx-scanner';
import { TicketService, TicketValidationResult } from '../../../services/ticket.service';
import { MessageService } from 'primeng/api';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-scan-ticket',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZXingScannerModule,
    ButtonModule,
    DialogModule,
    CardModule,
    DividerModule,
    TagModule,
    ToastModule,
    ProgressSpinnerModule,
    InputTextModule
  ],
  templateUrl: './scan-ticket.component.html',
  styleUrls: ['./scan-ticket.component.css']
})
export class ScanTicketComponent implements OnInit, OnDestroy {
  @ViewChild('scanner') scanner!: ZXingScannerComponent;

  // Scanner states
  scannerEnabled = false;
  scannerLoading = false;
  cameras: MediaDeviceInfo[] = [];
  currentDevice?: MediaDeviceInfo;
  
  // Validation states
  isValidating = false;
  validationResult: TicketValidationResult | null = null;
  showTicketDetails = false;
  
  // Manual entry
  manualTicketCode = '';
  showManualEntry = false;

  // Animation states
  showSuccessAnimation = false;
  showErrorAnimation = false;

  constructor(
    private ticketService: TicketService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.initCamera();
  }

  ngOnDestroy() {
    this.stopScanner();
  }

  async initCamera() {
    try {
      this.scannerLoading = true;
      
      // Get available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.cameras = devices.filter(device => device.kind === 'videoinput');
      
      if (this.cameras.length > 0) {
        // Prefer back camera for mobile
        const backCamera = this.cameras.find(camera => 
          camera.label.toLowerCase().includes('back') || 
          camera.label.toLowerCase().includes('rear')
        );
        
        this.currentDevice = backCamera || this.cameras[0];
        this.scannerLoading = false;
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'No Camera',
          detail: 'No camera found. Use manual entry instead.'
        });
        this.scannerLoading = false;
      }
    } catch (error) {
      console.error('Camera initialization error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Camera Error',
        detail: 'Failed to access camera. Please check permissions.'
      });
      this.scannerLoading = false;
    }
  }

  startScanner() {
    if (this.cameras.length > 0) {
      this.scannerEnabled = true;
      this.validationResult = null;
      this.showTicketDetails = false;
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Camera',
        detail: 'Please use manual entry option.'
      });
    }
  }

  stopScanner() {
    this.scannerEnabled = false;
  }

  toggleManualEntry() {
    this.showManualEntry = !this.showManualEntry;
    if (this.showManualEntry) {
      this.stopScanner();
    }
    this.manualTicketCode = '';
    this.validationResult = null;
    this.showTicketDetails = false;
  }

  switchCamera() {
    if (this.cameras.length > 1) {
      const currentIndex = this.cameras.findIndex(camera => camera.deviceId === this.currentDevice?.deviceId);
      const nextIndex = (currentIndex + 1) % this.cameras.length;
      this.currentDevice = this.cameras[nextIndex];
    }
  }

  onCodeResult(result: string) {
    if (result && !this.isValidating) {
      console.log('QR Code scanned:', result);
      this.validateTicket(result);
    }
  }

  onManualValidate() {
    if (this.manualTicketCode.trim()) {
      this.validateTicket(this.manualTicketCode.trim());
    }
  }

  onScanError(error: any) {
    console.error('Scan error:', error);
  }

  onPermissionResult(hasPermission: boolean) {
    console.log('Camera permission:', hasPermission);
    if (!hasPermission) {
      this.messageService.add({
        severity: 'error',
        summary: 'Camera Permission Denied',
        detail: 'Please allow camera access to use the scanner.'
      });
    }
  }

  async validateTicket(qrData: string) {
    this.isValidating = true;
    this.validationResult = null;
    this.showTicketDetails = false;
    
    // Extract ticket code from QR data
    const ticketCode = this.extractTicketCode(qrData);
    if (!ticketCode) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid QR Code',
        detail: 'Unable to extract ticket information from QR code'
      });
      this.isValidating = false;
      return;
    }
    
    try {
      const result = await this.ticketService.validateTicket(ticketCode).toPromise();
      this.validationResult = result ?? null;
      
      if (result?.canEnter) {
        this.showSuccessAnimation = true;
        this.showTicketDetails = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Valid Ticket',
          detail: 'Ticket is valid for entry'
        });
        
        // Hide success animation after 2 seconds
        setTimeout(() => {
          this.showSuccessAnimation = false;
        }, 2000);
        
      } else {
        this.showErrorAnimation = true;
        this.showTicketDetails = true;
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid Ticket',
          detail: result?.message || 'Ticket validation failed'
        });
        
        // Hide error animation after 2 seconds
        setTimeout(() => {
          this.showErrorAnimation = false;
        }, 2000);
      }
      
    } catch (error) {
      console.error('Validation error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Failed to validate ticket. Please try again.'
      });
      this.showErrorAnimation = true;
      setTimeout(() => {
        this.showErrorAnimation = false;
      }, 2000);
    } finally {
      this.isValidating = false;
      this.stopScanner(); // Stop scanner after validation
    }
  }

  async recordEntry() {
    if (!this.validationResult?.ticketDetails) return;
    
    try {
      const ticketCode = this.validationResult.ticketDetails.ticketCode;
      const result = await this.ticketService.recordEntry(ticketCode, 'GATE001').toPromise();
      
      if (result?.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Entry Recorded',
          detail: 'Customer can now enter the park'
        });
        
        // Reset for next scan
        this.resetScanner();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Entry Failed',
          detail: result?.message || 'Failed to record entry'
        });
      }
    } catch (error) {
      console.error('Entry recording error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Entry Error',
        detail: 'Failed to record entry. Please try again.'
      });
    }
  }

  resetScanner() {
    this.validationResult = null;
    this.showTicketDetails = false;
    this.manualTicketCode = '';
    this.showManualEntry = false;
    this.showSuccessAnimation = false;
    this.showErrorAnimation = false;
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'VALID': return 'success';
      case 'EXPIRED': return 'danger';
      case 'ALREADY_USED': return 'warning';
      case 'WRONG_DATE': return 'info';
      case 'INACTIVE':
      case 'NOT_FOUND':
      case 'SYSTEM_ERROR':
      default: return 'danger';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  private extractTicketCode(qrData: string): string | null {
    try {
      // Handle different QR code formats
      
      // Case 1: Simple ticket code (e.g., "TKT-12345")
      if (qrData.startsWith('TKT-')) {
        return qrData;
      }
      
      // Case 2: Complex format with pipe-separated data
      // e.g., "TICKET:TKT-12345|BOOKING:123|CUSTOMER:John|..."
      if (qrData.includes('TICKET:') && qrData.includes('|')) {
        const parts = qrData.split('|');
        for (const part of parts) {
          if (part.startsWith('TICKET:')) {
            return part.replace('TICKET:', '');
          }
        }
      }
      
      // Case 3: JSON format
      if (qrData.startsWith('{') && qrData.endsWith('}')) {
        const data = JSON.parse(qrData);
        return data.ticketCode || data.ticket_code || null;
      }
      
      // Case 4: URL encoded or other formats - try to find TKT- pattern
      const ticketMatch = qrData.match(/TKT-[a-zA-Z0-9\-]+/);
      if (ticketMatch) {
        return ticketMatch[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting ticket code from QR data:', error);
      return null;
    }
  }
}