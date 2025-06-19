/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponse } from './api-response';

/**
 * Validate request body against a Zod schema
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodType<T>
): Promise<{ success: true; data: T } | { success: false; response: Response }> {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate with zod schema
    const result = schema.safeParse(body);
    
    if (!result.success) {
      const formattedErrors = formatZodErrors(result.error);
      return {
        success: false,
        response: ApiResponse.validationError(formattedErrors)
      };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      response: ApiResponse.error('Invalid request body')
    };
  }
}

/**
 * Validate request query params against a Zod schema
 */
export function validateQuery<
  T extends Record<string, any>,
  Input = Record<string, string | string[]>
>(
  request: NextRequest,
  schema: z.ZodType<T, z.ZodTypeDef, Input>
): { success: true; data: T } | { success: false; response: Response } {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    
    // Validate with zod schema
    const result = schema.safeParse(params as Input);
    
    if (!result.success) {
      const formattedErrors = formatZodErrors(result.error);
      return {
        success: false,
        response: ApiResponse.validationError(formattedErrors)
      };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      response: ApiResponse.error('Invalid query parameters')
    };
  }
}

/**
 * Format Zod validation errors into a more usable format
 */
function formatZodErrors(error: z.ZodError) {
  const errors: Record<string, string[]> = {};
  
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    const field = path || 'global';
    
    if (!errors[field]) {
      errors[field] = [];
    }
    
    errors[field].push(issue.message);
  }
  
  return errors;
}
