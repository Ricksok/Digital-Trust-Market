/**
 * Cart Types
 */

export interface AddToCartInput {
  projectId: string;
  quantity?: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface CartItem {
  id: string;
  userId: string;
  projectId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  project?: {
    id: string;
    title: string;
    description: string;
    images?: string | string[];
    targetAmount: number;
    currentAmount: number;
    status: string;
    fundraiser?: {
      id: string;
      firstName?: string;
      lastName?: string;
      companyName?: string;
      trustBand?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

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


