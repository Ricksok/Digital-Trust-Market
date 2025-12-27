'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart, useCheckout } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';
import { Cart } from '@/lib/api/cart';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { CheckoutInput } from '@/lib/api/checkout';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { data: cart, isLoading: cartLoading } = useCart();
  const typedCart = cart as Cart | undefined;
  const checkout = useCheckout();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Kenya',
    phone: '',
  });

  const [billingAddress, setBillingAddress] = useState({
    sameAsShipping: true,
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Kenya',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('MPESA');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
    if (user) {
      setShippingAddress((prev) => ({
        ...prev,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || '',
        phone: user.phone || '',
      }));
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (typedCart && typedCart.items && typedCart.items.length === 0) {
      router.push('/cart');
    }
  }, [typedCart, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!typedCart || !typedCart.items || typedCart.items.length === 0) {
      return;
    }

    const checkoutInput: CheckoutInput = {
      shippingAddress,
      billingAddress: billingAddress.sameAsShipping ? undefined : billingAddress,
      paymentMethod,
      notes: notes || undefined,
    };

    checkout.mutate(checkoutInput);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (cartLoading) {
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
          <p className="text-gray-600 mb-8">Add some products before checkout!</p>
          <Link href="/marketplace">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Full Name"
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                  required
                />
                <Input
                  label="Address"
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    required
                  />
                  <Input
                    label="State/Province"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Postal Code"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    required
                  />
                  <Input
                    label="Country"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    required
                  />
                </div>
                <Input
                  label="Phone"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  required
                />
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sameAsShipping"
                    checked={billingAddress.sameAsShipping}
                    onChange={(e) => setBillingAddress({ ...billingAddress, sameAsShipping: e.target.checked })}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="sameAsShipping" className="ml-2 text-sm text-gray-700">
                    Same as shipping address
                  </label>
                </div>

                {!billingAddress.sameAsShipping && (
                  <div className="space-y-4">
                    <Input
                      label="Full Name"
                      value={billingAddress.fullName}
                      onChange={(e) => setBillingAddress({ ...billingAddress, fullName: e.target.value })}
                      required={!billingAddress.sameAsShipping}
                    />
                    <Input
                      label="Address"
                      value={billingAddress.address}
                      onChange={(e) => setBillingAddress({ ...billingAddress, address: e.target.value })}
                      required={!billingAddress.sameAsShipping}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="City"
                        value={billingAddress.city}
                        onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                        required={!billingAddress.sameAsShipping}
                      />
                      <Input
                        label="State/Province"
                        value={billingAddress.state}
                        onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Postal Code"
                        value={billingAddress.postalCode}
                        onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
                        required={!billingAddress.sameAsShipping}
                      />
                      <Input
                        label="Country"
                        value={billingAddress.country}
                        onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                        required={!billingAddress.sameAsShipping}
                      />
                    </div>
                    <Input
                      label="Phone"
                      value={billingAddress.phone}
                      onChange={(e) => setBillingAddress({ ...billingAddress, phone: e.target.value })}
                      required={!billingAddress.sameAsShipping}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="MPESA">M-Pesa</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CARD">Credit/Debit Card</option>
                    <option value="MOBILE_MONEY">Other Mobile Money</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special instructions or notes for your order..."
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
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
                    <span className="text-gray-600">Items ({typedCart.itemCount})</span>
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

                <Button type="submit" variant="primary" fullWidth disabled={checkout.isPending}>
                  {checkout.isPending ? 'Processing...' : `Place Order - ${formatCurrency(typedCart.total)}`}
                </Button>

                <Link href="/cart">
                  <Button variant="outline" fullWidth>
                    Back to Cart
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

