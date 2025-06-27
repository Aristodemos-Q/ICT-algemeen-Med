/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Appointment Redirect Handler
 * Handles authentication flow for appointment booking from homepage
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AppointmentRedirectPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is logged in, redirect to appointment booking
        router.push('/appointment-booking');
      } else {
        // User is not logged in, redirect to login with return URL
        router.push('/login?redirect=/appointment-booking&from=home');
      }
    }
  }, [user, loading, router]);

  // Show loading while we determine redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Even geduld...</h2>
        <p className="text-gray-500 mt-2">
          {loading ? 'Controleren van inlogstatus...' : 'Doorverwijzen...'}
        </p>
      </div>
    </div>
  );
}
