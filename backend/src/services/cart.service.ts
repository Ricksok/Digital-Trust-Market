import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { AddToCartInput, UpdateCartItemInput } from '../types/cart.types';

const prisma = new PrismaClient();

/**
 * Get user's cart with all items and totals
 */
export const getCart = async (userId: string) => {
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

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.16; // 16% VAT
  const shipping = subtotal >= 10000 ? 0 : 500; // Free shipping over 10,000 KES
  const total = subtotal + tax + shipping;

  // Format response
  const items = cartItems.map((item) => {
    const images = item.project.images ? JSON.parse(item.project.images) : [];
    return {
      id: item.id,
      userId: item.userId,
      projectId: item.projectId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      project: {
        id: item.project.id,
        title: item.project.title,
        description: item.project.description,
        images: Array.isArray(images) ? images : [],
        targetAmount: item.project.targetAmount,
        currentAmount: item.project.currentAmount,
        status: item.project.status,
        fundraiser: item.project.fundraiser,
      },
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  });

  return {
    items,
    itemCount: items.length,
    subtotal,
    tax,
    shipping,
    total,
  };
};

/**
 * Add item to cart (or update quantity if exists)
 */
export const addToCart = async (userId: string, input: AddToCartInput) => {
  const { projectId, quantity = 1 } = input;

  // Verify project exists and is active
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw createError('Project not found', 404);
  }

  if (project.status !== 'ACTIVE' && project.status !== 'APPROVED') {
    throw createError('Project is not available for purchase', 400);
  }

  // Calculate price (using minInvestment as unit price for now)
  const unitPrice = project.minInvestment;
  const totalPrice = unitPrice * quantity;

  // Check if item already exists in cart
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
        unitPrice, // Update price in case it changed
        totalPrice: newTotalPrice,
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

    return getCart(userId);
  }

  // Create new cart item
  await prisma.cartItem.create({
    data: {
      userId,
      projectId,
      quantity,
      unitPrice,
      totalPrice,
    },
  });

  return getCart(userId);
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (
  userId: string,
  itemId: string,
  input: UpdateCartItemInput
) => {
  const { quantity } = input;

  if (quantity < 1) {
    throw createError('Quantity must be at least 1', 400);
  }

  // Verify item belongs to user
  const item = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      userId,
    },
    include: {
      project: true,
    },
  });

  if (!item) {
    throw createError('Cart item not found', 404);
  }

  // Update price in case project price changed
  const unitPrice = item.project.minInvestment;
  const totalPrice = unitPrice * quantity;

  await prisma.cartItem.update({
    where: { id: itemId },
    data: {
      quantity,
      unitPrice,
      totalPrice,
    },
  });

  return getCart(userId);
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (userId: string, itemId: string) => {
  // Verify item belongs to user
  const item = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      userId,
    },
  });

  if (!item) {
    throw createError('Cart item not found', 404);
  }

  await prisma.cartItem.delete({
    where: { id: itemId },
  });

  return getCart(userId);
};

/**
 * Clear all items from cart
 */
export const clearCart = async (userId: string) => {
  await prisma.cartItem.deleteMany({
    where: { userId },
  });

  return getCart(userId);
};

