export interface OrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  notes?: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface PaymentResponse {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  status: string;
  amount: string;
  currency: string;
  receipt: string;
  createdAt: string;
  notes?: { [key: string]: any };
  keyId: string;
  message: string;
  success: boolean;
}

export interface PaymentVerificationResponse extends PaymentResponse {}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill: {
    name: string;
    email?: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}