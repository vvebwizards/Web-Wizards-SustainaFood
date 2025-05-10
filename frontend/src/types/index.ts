export interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  delivery?: {
    method?: string;
    scheduledDate?: string; // ISO date string
    scheduledTime?: string;
    notes?: string;
    trackingNumber?: string;
    estimatedDelivery?: string; // ISO date string
  };
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  notes?: string;
  
}

export interface OrderItem {
  productId: string;
  name: string;
  orderedQuantity: number;
  price: number;
  sku?: string;
  weight?: number;
  urgencyScore?: number;
}

export type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned: number;
}

export interface OrderFilters {
  status?: OrderStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
  sortBy?: keyof Order;
  sortOrder?: 'asc' | 'desc';
}
