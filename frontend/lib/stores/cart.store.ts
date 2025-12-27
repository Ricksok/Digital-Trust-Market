import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
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
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  setCart: (cart: Cart | null) => void;
  setLoading: (loading: boolean) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: null,
      isLoading: false,
      setCart: (cart) => set({ cart }),
      setLoading: (isLoading) => set({ isLoading }),
      clearCart: () => set({ cart: null }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ cart: state.cart }), // Only persist cart data
    }
  )
);


