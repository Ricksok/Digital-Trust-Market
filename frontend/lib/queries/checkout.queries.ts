import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkoutApi, CheckoutInput, Order } from '@/lib/api/checkout';
import { useCartStore } from '@/lib/stores/cart.store';
import { useUIStore } from '@/lib/stores/ui.store';
import { useRouter } from 'next/navigation';

/**
 * Get orders query hook
 */
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await checkoutApi.getOrders();
      return response.data as Order[];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Get order by ID query hook
 */
export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await checkoutApi.getOrder(orderId);
      return response.data as Order;
    },
    enabled: !!orderId,
  });
};

/**
 * Checkout mutation hook
 */
export const useCheckout = () => {
  const queryClient = useQueryClient();
  const { clearCart } = useCartStore();
  const { showNotification } = useUIStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: CheckoutInput) => checkoutApi.checkout(input),
    onSuccess: (data) => {
      const order: Order = data.data;
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      clearCart();
      showNotification({
        type: 'success',
        message: `Order ${order.orderNumber} created successfully!`,
      });
      router.push(`/orders/${order.id}`);
    },
    onError: (error: any) => {
      showNotification({
        type: 'error',
        message: error.response?.data?.error?.message || 'Failed to create order',
      });
    },
  });
};

