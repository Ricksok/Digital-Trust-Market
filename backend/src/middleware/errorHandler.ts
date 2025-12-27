import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error({
    error: message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Extract additional info from error object
  const additionalInfo: any = {};
  Object.keys(err).forEach((key) => {
    if (key !== 'message' && key !== 'statusCode' && key !== 'isOperational' && key !== 'stack' && key !== 'name') {
      additionalInfo[key] = (err as any)[key];
    }
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(Object.keys(additionalInfo).length > 0 ? additionalInfo : {}),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

export interface CreateErrorOptions {
  additionalInfo?: any;
  [key: string]: any;
}

export const createError = (
  message: string, 
  statusCode: number = 500,
  options?: CreateErrorOptions
): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  
  // Attach additional info to error object
  if (options) {
    Object.assign(error, options);
  }
  
  return error;
};


