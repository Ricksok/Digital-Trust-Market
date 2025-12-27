import apiClient from './client';

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

export interface AddToCartInput {
  projectId: string;
  quantity?: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export const cartApi = {
  getCart: async () => {
    const response = await apiClient.get('/api/cart');
    return response.data;
  },

  addToCart: async (input: AddToCartInput) => {
    const response = await apiClient.post('/api/cart/add', input);
    return response.data;
  },

  updateCartItem: async (itemId: string, input: UpdateCartItemInput) => {
    const response = await apiClient.put(`/api/cart/${itemId}`, input);
    return response.data;
  },

  removeFromCart: async (itemId: string) => {
    const response = await apiClient.delete(`/api/cart/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await apiClient.delete('/api/cart');
    return response.data;
  },
};


