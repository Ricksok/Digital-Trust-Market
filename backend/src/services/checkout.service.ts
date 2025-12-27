import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { CheckoutInput } from '../types/cart.types';

const prisma = new PrismaClient();

/**
 * Generate order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Create order from cart
 */
export async function createOrder(userId: string, input: CheckoutInput) {
  try {
    // Get user's cart
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            fundraiser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                companyName: true,
              },
            },
          },
        },
      },
    });

    if (cartItems.length === 0) {
      throw createError('Cart is empty', 400);
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum: number, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.16; // 16% VAT
    const shipping = subtotal > 10000 ? 0 : 500; // Free shipping over 10,000 KES
    const discount = 0; // Could add discount logic here
    const total = subtotal + tax + shipping - discount;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        orderNumber: generateOrderNumber(),
        status: 'PENDING',
        subtotal,
        tax,
        shipping,
        discount,
        total,
        currency: 'KES',
        shippingAddress: JSON.stringify(input.shippingAddress),
        billingAddress: input.billingAddress ? JSON.stringify(input.billingAddress) : null,
        paymentMethod: input.paymentMethod,
        paymentStatus: 'PENDING',
        notes: input.notes,
      },
    });

    // Create order items
    const orderItems = await Promise.all(
      cartItems.map(async (cartItem: any) => {
        const project = cartItem.project;
        const images = project.images ? (typeof project.images === 'string' ? JSON.parse(project.images) : project.images) : [];
        const firstImage = Array.isArray(images) && images.length > 0 ? images[0] : null;

        return prisma.orderItem.create({
          data: {
            orderId: order.id,
            projectId: project.id,
            productTitle: project.title,
            productDescription: project.description,
            productImage: firstImage || null,
            unitPrice: cartItem.unitPrice,
            quantity: cartItem.quantity,
            totalPrice: cartItem.totalPrice,
            status: 'PENDING',
          },
        });
      })
    );

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: total,
        currency: 'KES',
        status: 'PENDING',
        paymentMethod: input.paymentMethod,
        transactionId: `TXN-${order.orderNumber}`,
      },
    });

    // Link payment to order
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: payment.id },
    });

    // Return order with items
    const orderWithItems = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: true,
        payment: true,
      },
    });

    return orderWithItems;
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Error creating order:', error);
    throw createError('Failed to create order', 500);
  }
}

/**
 * Get user's orders
 */
export async function getUserOrders(userId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            transactionId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  } catch (error: any) {
    console.error('Error getting orders:', error);
    throw createError('Failed to get orders', 500);
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string, userId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            project: {
              include: {
                fundraiser: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    companyName: true,
                    trustBand: true,
                  },
                },
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!order) {
      throw createError('Order not found', 404);
    }

    if (order.userId !== userId) {
      throw createError('Unauthorized', 403);
    }

    return order;
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Error getting order:', error);
    throw createError('Failed to get order', 500);
  }
}

