export interface BookingItem {
  offering_id: number;
  category_id: number;
  ticket_type_id: number;
  quantity: number;
  unit_price: number;
}

export interface BookingInfo {
  bookingId?: number;
  name?: string;
  mobile?: string;
  email?: string;
  customerName?: string;
  customerPhone?: string;
  booking_items?: BookingItem[];
  customerEmail?: string;
  totalAmount: number;
  taxAmount?: number;
  tax_amount?: number;
  totalCount: number;
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  paymentMethod?: string;
  payment_method?: string;
  bookingItems?: string;
  visitDate: string;
  validFrom: string;
  validTo: string;
  createDate?: string;
  createdBy: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
}

export interface CreateBookingRequest extends BookingInfo {}