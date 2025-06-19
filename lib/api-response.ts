/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

import { NextResponse } from 'next/server';

type ApiResponseOptions = {
  status?: number;
  headers?: Record<string, string>;
};

/**
 * Helper for consistently formatted API responses
 */
export const ApiResponse = {
  /**
   * Create a success response
   */
  success: <T>(data: T, options: ApiResponseOptions = {}) => {
    return NextResponse.json({ 
      success: true, 
      data 
    }, { 
      status: options.status || 200,
      headers: options.headers
    });
  },

  /**
   * Create an error response
   */
  error: (message: string, options: ApiResponseOptions = {}) => {
    return NextResponse.json({ 
      success: false, 
      error: message
    }, { 
      status: options.status || 500,
      headers: options.headers
    });
  },

  /**
   * Create a validation error response
   */
  validationError: (errors: Record<string, string[]> | string[], options: ApiResponseOptions = {}) => {
    return NextResponse.json({ 
      success: false, 
      error: 'Validation failed', 
      errors 
    }, { 
      status: options.status || 400,
      headers: options.headers
    });
  }
};
