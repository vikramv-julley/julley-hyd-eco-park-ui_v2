import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderRequest, PaymentResponse, PaymentVerificationRequest, PaymentVerificationResponse } from '../models/payment.model';
import { environment } from '../../environments/environment';

declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl || 'http://localhost:8080/api';

  createOrder(orderRequest: OrderRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.baseUrl}/payments/orders`, orderRequest);
  }

  initiatePayment(paymentResponse: PaymentResponse, customerDetails: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        key: paymentResponse.keyId,
        amount: parseInt(paymentResponse.amount) * 100, // Convert to paise
        currency: paymentResponse.currency,
        name: 'Eco Tourism Booking',
        description: 'Ticket Booking Payment',
        order_id: paymentResponse.razorpayOrderId,
        handler: (response: any) => {
          resolve({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            orderId: paymentResponse.orderId
          });
        },
        prefill: {
          name: customerDetails.customerName,
          email: customerDetails.customerEmail || '',
          contact: customerDetails.customerPhone
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            reject('Payment cancelled by user');
          }
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    });
  }

  verifyPayment(verificationRequest: PaymentVerificationRequest): Observable<PaymentVerificationResponse> {
    return this.http.post<PaymentVerificationResponse>(`${this.baseUrl}/payments/verify`, verificationRequest);
  }

  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
}