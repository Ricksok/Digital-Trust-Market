import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from './auth.middleware';

const prisma = new PrismaClient();

export const auditLog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const originalSend = res.send;

  res.send = function (data) {
    // Log after response is sent
    setImmediate(async () => {
      try {
        await prisma.auditLog.create({
          data: {
            userId: req.user?.id,
            action: `${req.method} ${req.path}`,
            entityType: req.path.split('/')[2] || 'unknown',
            entityId: req.params.id || 'unknown',
            changes: req.body,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
          },
        });
      } catch (error) {
        console.error('Failed to create audit log:', error);
      }
    });

    return originalSend.call(this, data);
  };

  next();
};


