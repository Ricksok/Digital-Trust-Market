import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import axios from 'axios';

const prisma = new PrismaClient();

// String constants for SQLite (no enums)
const PaymentStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

export const initiatePayment = async (userId: string, data: {
  investmentId?: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
}) => {
  // TODO: Integrate with payment gateway
  // const paymentGatewayResponse = await processPayment(data);

  const payment = await prisma.payment.create({
    data: {
      userId,
      investmentId: data.investmentId,
      amount: data.amount,
      currency: data.currency || 'USD',
      paymentMethod: data.paymentMethod,
      status: PaymentStatus.PENDING,
      gatewayResponse: JSON.stringify({}), // paymentGatewayResponse
    },
    include: {
      investment: {
        select: {
          id: true,
          projectId: true,
          amount: true,
        },
      },
    },
  });

  return payment;
};

export const handleWebhook = async (payload: any, headers: any) => {
  // TODO: Verify webhook signature
  // TODO: Process payment status update from gateway

  const { paymentId, status, transactionId } = payload;

  if (paymentId) {
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: status as string,
        transactionId,
        gatewayResponse: JSON.stringify(payload),
      },
    });

    // If payment is completed, update investment status
    if (status === PaymentStatus.COMPLETED) {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { investment: true },
      });

      if (payment?.investmentId) {
        await prisma.investment.update({
          where: { id: payment.investmentId },
          data: { status: 'APPROVED' },
        });
      }

      // Track user activity (payment completion)
      if (payment?.userId) {
        try {
          const { trackUserActivity } = await import('./trust.service');
          await trackUserActivity(payment.userId, 'PAYMENT', 1.5); // Higher value for payment completion
        } catch (error) {
          // Non-critical - log but don't fail payment processing
          console.error('Failed to track user activity on payment completion:', error);
        }
      }
    }
  }
};

export const getPaymentById = async (id: string, userId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      investment: {
        include: {
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw createError('Payment not found', 404);
  }

  if (payment.userId !== userId) {
    throw createError('Unauthorized', 403);
  }

  return payment;
};

export const getPayments = async (userId: string, query: any) => {
  const { page = 1, limit = 10, status } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = { userId };
  if (status) where.status = status;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        investment: {
          select: {
            id: true,
            projectId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const refundPayment = async (id: string, userId: string, data: {
  reason?: string;
}) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
  });

  if (!payment) {
    throw createError('Payment not found', 404);
  }

  if (payment.userId !== userId) {
    throw createError('Unauthorized', 403);
  }

  if (payment.status !== PaymentStatus.COMPLETED) {
    throw createError('Only completed payments can be refunded', 400);
  }

  // TODO: Process refund through payment gateway

  const refundedPayment = await prisma.payment.update({
    where: { id },
    data: { status: PaymentStatus.REFUNDED },
  });

  return refundedPayment;
};


