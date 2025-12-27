'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';
import { Cart } from '@/lib/api/cart';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data: cart, isLoading } = useCart();
  const typedCart = cart as Cart | undefined;
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleQuantityChange = (itemId: string, currentQuantity: number, delta: number) => {
    const newQuantity = Math.max(1, currentQuantity + delta);
    updateCartItem.mutate({ itemId, input: { quantity: newQuantity } });
  };

  const handleRemove = (itemId: string) => {
    if (window.confirm('Remove this item from cart?')) {
      removeFromCart.mutate(itemId);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!typedCart || !typedCart.items || typedCart.items.length === 0) {
    return (
      <div className="page-container">
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some products to get started!</p>
          <Link href="/marketplace">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <Button variant="outline" onClick={() => clearCart.mutate()}>
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {typedCart.items.map((item) => {
            const images = item.project?.images
              ? typeof item.project.images === 'string'
                ? JSON.parse(item.project.images)
                : item.project.images
              : [];
            const firstImage = Array.isArray(images) && images.length > 0 ? images[0] : null;

            return (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                      {firstImage ? (
                        <Image src={firstImage} alt={item.project?.title || 'Product'} fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-gray-400">📦</div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow">
                      <Link href={`/marketplace/products/${item.projectId}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 mb-1">
                          {item.project?.title || 'Product'}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {item.project?.description || ''}
                      </p>
                      {item.project?.fundraiser?.trustBand && (
                        <Badge variant="outline" size="sm" className="mb-2">
                          Trust: {item.project.fundraiser.trustBand}
                        </Badge>
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                            disabled={updateCartItem.isPending || item.quantity <= 1}
                          >
                            -
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                            disabled={updateCartItem.isPending}
                          >
                            +
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(item.totalPrice)}</p>
                          <p className="text-sm text-gray-500">{formatCurrency(item.unitPrice)} each</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemove(item.id)}
                        disabled={removeFromCart.isPending}
                        className="mt-2 text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(typedCart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (16% VAT)</span>
                    <span className="font-medium">{formatCurrency(typedCart.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {typedCart.shipping === 0 ? 'Free' : formatCurrency(typedCart.shipping)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-primary-600">{formatCurrency(typedCart.total)}</span>
                  </div>
              </div>

              <Link href="/checkout">
                <Button variant="primary" fullWidth>
                  Proceed to Checkout
                </Button>
              </Link>

              <Link href="/marketplace">
                <Button variant="outline" fullWidth>
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

