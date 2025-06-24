/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Dashboard Header Component
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell, Menu, Heart, ArrowLeft } from 'lucide-react';
import UserProfileMenu from './user-profile-menu';

interface DashboardHeaderProps {
  toggleSidebar?: () => void;
  showMobileToggle?: boolean;
}

export default function DashboardHeader({ toggleSidebar, showMobileToggle = false }: DashboardHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-4 sm:px-6">
      {/* Back to Home Button */}
      <Button asChild variant="ghost" size="icon" className="shrink-0">
        <Link href="/">
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Terug naar Home</span>
        </Link>
      </Button>

      {showMobileToggle && (
        <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      )}

      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="bg-red-500 rounded-lg p-2 shadow-md">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg text-gray-900">MedCheck+</h1>
            <p className="text-xs text-gray-500">Patiënt Portal</p>
          </div>
        </Link>
      </div>
      
      <div className="flex-1">
        {/* Search functionality can be added here later */}
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="sr-only">Notifications</span>
        </Button>
        
        <UserProfileMenu />
      </div>
    </header>
  );
}
