import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { cartApi, Cart, AddToCartInput, UpdateCartItemInput } from '@/lib/api/cart';
import { useCartStore } from '@/lib/stores/cart.store';
import { useUIStore } from '@/lib/stores/ui.store';

/**
 * Get cart query hook
 */
export const useCart = () => {
  const { setCart, setLoading } = useCartStore();

  const query = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await cartApi.getCart();
      // Backend returns { success: true, data: cart }
      // API client returns response.data which is { success: true, data: cart }
      const cart: Cart = (response as any).data || response;
      setCart(cart);
      return cart;
    },
    staleTime: 0, // Always refetch
  });

  useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading, setLoading]);

  return query;
};

/**
 * Add to cart mutation hook
 */
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: async (input: AddToCartInput) => {
      const response = await cartApi.addToCart(input);
      // Backend returns { success: true, data: cart }
      // API client returns response.data which is { success: true, data: cart }
      return (response as any).data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      showNotification({
        type: 'success',
        message: 'Item added to cart',
      });
    },
    onError: (error: any) => {
      console.error('Add to cart error:', error);
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message ||
                          error.message || 
                          'Failed to add item to cart';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Update cart item mutation hook
 */
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: UpdateCartItemInput }) =>
      cartApi.updateCartItem(itemId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      showNotification({
        type: 'error',
        message: error.response?.data?.error?.message || 'Failed to update cart item',
      });
    },
  });
};

/**
 * Remove from cart mutation hook
 */
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      showNotification({
        type: 'success',
        message: 'Item removed from cart',
      });
    },
    onError: (error: any) => {
      showNotification({
        type: 'error',
        message: error.response?.data?.error?.message || 'Failed to remove item from cart',
      });
    },
  });
};

/**
 * Clear cart mutation hook
 */
export const useClearCart = () => {
  const queryClient = useQueryClient();
  const { clearCart } = useCartStore();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      clearCart();
      showNotification({
        type: 'success',
        message: 'Cart cleared',
      });
    },
    onError: (error: any) => {
      showNotification({
        type: 'error',
        message: error.response?.data?.error?.message || 'Failed to clear cart',
      });
    },
  });
};

