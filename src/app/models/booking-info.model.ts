export interface BookingItem {
  offering_id: number;
  category_id: number;
  ticket_type_id: number;
  quantity: number;
  unit_price: number;
}

export interface BookingInfo {
  customerName: string;
  customerPhone: string;
  booking_items: BookingItem[];
  customerEmail?: string;
  totalAmount: number;
  tax_amount: number;
  totalCount: number;
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  payment_method: string;
  visitDate: string;
  validFrom: string;
  validTo: string;
  createdBy: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
}

export interface CreateBookingRequest extends BookingInfo {}