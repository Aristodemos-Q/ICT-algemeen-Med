/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from './supabaseClient';
import { ApiResponse } from './api-response';

/**
 * Basic authentication middleware for API routes
 */
export async function authMiddleware(request: NextRequest) {
  // Skip auth for public routes or non-production environments if needed
  if (process.env.NODE_ENV !== 'production') {
    return null; // Continue to handler
  }
  
  // Get the token from Authorization header
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.error('Unauthorized', { status: 401 });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return ApiResponse.error('Unauthorized', { status: 401 });
    }
    
    // Attach user to request for use in route handlers
    // Note: Next.js doesn't allow modifying request object directly
    // Use other mechanisms like middleware or context if needed
    return null; // Continue to handler
  } catch (error) {
    console.error('Authentication error:', error);
    return ApiResponse.error('Authentication failed', { status: 401 });
  }
}
