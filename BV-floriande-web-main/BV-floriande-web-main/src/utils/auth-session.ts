/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Auth Session Utilities
 * Provides utilities for handling auth session errors gracefully
 */

import { AuthError } from '@supabase/supabase-js';

/**
 * Checks if an error is an AuthSessionMissingError
 */
export function isAuthSessionMissingError(error: any): boolean {
  return (
    error instanceof Error && 
    error.message.includes('Auth session missing')
  ) || (
    error instanceof AuthError && 
    error.name === 'AuthSessionMissingError'
  );
}

/**
 * Handles auth operations gracefully, catching session missing errors
 */
export async function handleAuthOperation<T>(
  operation: () => Promise<T>,
  fallbackValue?: T
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    if (isAuthSessionMissingError(error)) {
      console.warn('Auth session missing, operation skipped:', error);
      return fallbackValue ?? null;
    }
    throw error; // Re-throw non-session errors
  }
}

/**
 * Wraps auth service calls to handle session errors gracefully
 */
export class SafeAuthWrapper {
  static async signOut(authService: any): Promise<void> {
    await handleAuthOperation(
      () => authService.supabase.auth.signOut(),
      undefined
    );
  }

  static async getCurrentUser(authService: any) {
    return handleAuthOperation(
      () => authService.getCurrentUser(),
      null
    );
  }

  static async getSession(authService: any) {
    return handleAuthOperation(
      () => authService.supabase.auth.getSession(),
      { data: { session: null }, error: null }
    );
  }
}
