/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'trainer';
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    console.log('🛡️ ProtectedRoute check:', { user: !!user, loading, userEmail: user?.email });
    
    if (!loading) {
      if (!user) {
        console.log('🚫 No user found in ProtectedRoute, redirecting to:', redirectTo);
        // Add small delay to prevent race condition with AuthContext
        setTimeout(() => {
          router.replace(redirectTo);
        }, 100);
        return;
      } else {
        console.log('✅ User authenticated in ProtectedRoute:', user.email);
      }

      // TODO: Add role checking when user profile data is available
      // if (requiredRole && user.role !== requiredRole) {
      //   router.replace('/unauthorized');
      //   return;
      // }
    }
  }, [user, loading, router, requiredRole, redirectTo]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Authenticatie controleren...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while redirecting if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Doorsturen naar login...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
