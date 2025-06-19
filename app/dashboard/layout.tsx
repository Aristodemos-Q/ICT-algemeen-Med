/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { Navigation } from '@/components/dashboard/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push('/login');
    }
  }, [mounted, loading, user, router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary/10 to-primary/10">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Laden...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      <Navigation />
      <main className="flex-1 py-6">
        {children}
      </main>
      <footer className="bg-primary text-white py-4 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white rounded-lg p-1 mr-3 shadow-md flex-shrink-0 border border-secondary">
                <img 
                  src="/bv florande2.webp" 
                  alt="BV Floriande Logo" 
                  className="h-8 w-8 object-contain"
                />
              </div>
              <span className="font-bold text-sm">Badminton Vereniging Floriande</span>
            </div>
            <div className="text-xs opacity-80">
              © {new Date().getFullYear()} BV Floriande - Alle rechten voorbehouden
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
