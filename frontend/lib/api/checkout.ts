import apiClient from './client';

export interface CheckoutInput {
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  billingAddress?: {
    fullName: string;
    address: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  projectId: string;
  productTitle: string;
  productDescription?: string;
  productImage?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  status: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  paymentStatus: string;
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export const checkoutApi = {
  checkout: async (input: CheckoutInput) => {
    const response = await apiClient.post('/api/checkout/checkout', input);
    return response.data;
  },

  getOrders: async () => {
    const response = await apiClient.get('/api/checkout/orders');
    return response.data;
  },

  getOrder: async (orderId: string) => {
    const response = await apiClient.get(`/api/checkout/orders/${orderId}`);
    return response.data;
  },
};


