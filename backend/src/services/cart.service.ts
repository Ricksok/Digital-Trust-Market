import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { AddToCartInput, UpdateCartItemInput } from '../types/cart.types';

const prisma = new PrismaClient();

/**
 * Get user's cart
 */
export async function getCart(userId: string) {
  try {
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
                trustBand: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const subtotal = cartItems.reduce((sum: number, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.16; // 16% VAT (Kenya)
    const shipping = subtotal > 10000 ? 0 : 500; // Free shipping over 10,000 KES
    const total = subtotal + tax + shipping;

    return {
      items: cartItems,
      itemCount: cartItems.reduce((sum: number, item) => sum + item.quantity, 0),
      subtotal,
      tax,
      shipping,
      total,
    };
  } catch (error: any) {
    console.error('Error getting cart:', error);
    throw createError('Failed to get cart', 500);
  }
}

/**
 * Add item to cart
 */
export async function addToCart(userId: string, input: AddToCartInput) {
  try {
    const { projectId, quantity = 1 } = input;

    // Verify project exists and is active
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw createError('Project not found', 404);
    }

    if (project.status !== 'ACTIVE') {
      throw createError('Project is not available for purchase', 400);
    }

    // Use targetAmount as unit price (or could be a separate price field)
    const unitPrice = project.targetAmount;
    const totalPrice = unitPrice * quantity;

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      const newTotalPrice = unitPrice * newQuantity;

      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          totalPrice: newTotalPrice,
          unitPrice, // Update price in case it changed
        },
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
      });

      return updated;
    }

    // Create new cart item
    const cartItem = await prisma.cartItem.create({
      data: {
        userId,
        projectId,
        quantity,
        unitPrice,
        totalPrice,
      },
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
    });

    return cartItem;
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Error adding to cart:', error);
    throw createError('Failed to add item to cart', 500);
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(userId: string, itemId: string, input: UpdateCartItemInput) {
  try {
    const { quantity } = input;

    if (quantity <= 0) {
      throw createError('Quantity must be greater than 0', 400);
    }

    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!cartItem) {
      throw createError('Cart item not found', 404);
    }

    if (cartItem.userId !== userId) {
      throw createError('Unauthorized', 403);
    }

    // Get current project price
    const project = await prisma.project.findUnique({
      where: { id: cartItem.projectId },
    });

    if (!project) {
      throw createError('Project not found', 404);
    }

    const unitPrice = project.targetAmount;
    const totalPrice = unitPrice * quantity;

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        unitPrice,
        totalPrice,
      },
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
    });

    return updated;
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Error updating cart item:', error);
    throw createError('Failed to update cart item', 500);
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(userId: string, itemId: string) {
  try {
    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!cartItem) {
      throw createError('Cart item not found', 404);
    }

    if (cartItem.userId !== userId) {
      throw createError('Unauthorized', 403);
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return { success: true };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Error removing from cart:', error);
    throw createError('Failed to remove item from cart', 500);
  }
}

/**
 * Clear cart
 */
export async function clearCart(userId: string) {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    throw createError('Failed to clear cart', 500);
  }
}

