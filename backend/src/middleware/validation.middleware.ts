/**
 * Request Validation Middleware
 * Validates request body, query, and params according to schema
 */

import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';

interface ValidationRule {
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  email?: boolean;
  enum?: string[];
  pattern?: RegExp;
}

interface ValidationSchema {
  body?: Record<string, ValidationRule>;
  query?: Record<string, ValidationRule>;
  params?: Record<string, ValidationRule>;
}

/**
 * Validate request against schema
 */
export function validateRequest(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (schema.body) {
        validateObject(req.body, schema.body, 'body');
      }

      // Validate query
      if (schema.query) {
        validateObject(req.query as Record<string, any>, schema.query, 'query');
      }

      // Validate params
      if (schema.params) {
        validateObject(req.params, schema.params, 'params');
      }

      next();
    } catch (error: any) {
      next(createError(error.message, 400));
    }
  };
}

/**
 * Validate an object against rules
 */
function validateObject(
  obj: Record<string, any>,
  rules: Record<string, ValidationRule>,
  source: string
): void {
  for (const [key, rule] of Object.entries(rules)) {
    const value = obj[key];

    // Check required
    if (rule.required && (value === undefined || value === null || value === '')) {
      throw new Error(`${source}.${key} is required`);
    }

    // Skip validation if value is not provided and not required
    if (value === undefined || value === null) {
      continue;
    }

    // Type validation
    if (rule.type === 'string' && typeof value !== 'string') {
      throw new Error(`${source}.${key} must be a string`);
    }

    if (rule.type === 'number' && typeof value !== 'number' && isNaN(Number(value))) {
      throw new Error(`${source}.${key} must be a number`);
    }

    if (rule.type === 'boolean' && typeof value !== 'boolean') {
      throw new Error(`${source}.${key} must be a boolean`);
    }

    if (rule.type === 'date') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error(`${source}.${key} must be a valid date`);
      }
    }

    if (rule.type === 'array' && !Array.isArray(value)) {
      throw new Error(`${source}.${key} must be an array`);
    }

    if (rule.type === 'object' && typeof value !== 'object' || Array.isArray(value)) {
      throw new Error(`${source}.${key} must be an object`);
    }

    // String validations
    if (rule.type === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        throw new Error(`${source}.${key} must be at least ${rule.minLength} characters`);
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        throw new Error(`${source}.${key} must be at most ${rule.maxLength} characters`);
      }

      if (rule.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new Error(`${source}.${key} must be a valid email`);
        }
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        throw new Error(`${source}.${key} does not match required pattern`);
      }
    }

    // Number validations
    if (rule.type === 'number') {
      const numValue = Number(value);
      if (rule.min !== undefined && numValue < rule.min) {
        throw new Error(`${source}.${key} must be at least ${rule.min}`);
      }

      if (rule.max !== undefined && numValue > rule.max) {
        throw new Error(`${source}.${key} must be at most ${rule.max}`);
      }
    }

    // Enum validation
    if (rule.enum && !rule.enum.includes(value)) {
      throw new Error(`${source}.${key} must be one of: ${rule.enum.join(', ')}`);
    }
  }
}

