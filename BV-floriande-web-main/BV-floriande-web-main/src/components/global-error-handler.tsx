/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Global Error Handler
 * Handles unhandled authentication errors
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function GlobalErrorHandler() {
  const router = useRouter();

  useEffect(() => {
    // Handle unhandled promise rejections (including AuthSessionMissingError)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      if (error instanceof Error && 
          (error.message.includes('Auth session missing') || 
           error.message.includes('AuthSessionMissingError'))) {
        console.warn('Unhandled auth session error caught globally:', error.message);
        
        // Prevent the error from bubbling up
        event.preventDefault();
        
        // Clear any stored auth data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase.auth.token');
          sessionStorage.clear();
        }
        
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 100);
        
        return;
      }
      
      // Let other errors bubble up normally
      console.error('Unhandled promise rejection:', error);
    };

    // Handle general window errors
    const handleWindowError = (event: ErrorEvent) => {
      const error = event.error;
      
      if (error instanceof Error && 
          (error.message.includes('Auth session missing') || 
           error.message.includes('AuthSessionMissingError'))) {
        console.warn('Unhandled auth session error caught globally:', error.message);
        
        // Prevent the error from bubbling up
        event.preventDefault();
        
        // Clear any stored auth data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase.auth.token');
          sessionStorage.clear();
        }
        
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 100);
        
        return;
      }
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleWindowError);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleWindowError);
    };
  }, [router]);

  return null; // This component doesn't render anything
}
