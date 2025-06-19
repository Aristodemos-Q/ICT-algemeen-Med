/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, Menu, Settings, User } from 'lucide-react';
import { authService } from '@/lib/authService';
import UserProfileMenu from './user-profile-menu';

interface DashboardHeaderProps {
  toggleSidebar?: () => void;
}

export default function DashboardHeader({ toggleSidebar }: DashboardHeaderProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-primary text-white px-4 sm:px-6">
      <Button variant="ghost" size="icon" className="shrink-0 md:hidden text-white hover:bg-primary-600" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      
      <div className="flex items-center gap-2 md:hidden">
        <div className="bg-white rounded-lg p-1 mr-2 shadow-md flex-shrink-0 border-2 border-secondary">
          <img 
            src="/bv florande2.webp" 
            alt="BV Floriande Logo" 
            className="h-8 w-8 object-contain"
          />
        </div>
        <span className="font-semibold">BV Floriande</span>
      </div>
      
      <div className="hidden md:flex items-center gap-2">
        <Link href="/" className="flex items-center">
          <div className="bg-white rounded-lg p-1 mr-3 shadow-md flex-shrink-0 border-2 border-secondary">
            <img 
              src="/bv florande2.webp" 
              alt="BV Floriande Logo" 
              className="h-8 w-8 object-contain"
            />
          </div>
          <span className="font-semibold text-lg">BV Floriande Trainers Platform</span>
        </Link>
      </div>
      
      <div className="flex-1">
        {/* Search functionality can be added here later */}
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-white hover:bg-primary-600">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
          </span>
          <span className="sr-only">Notifications</span>
        </Button>
        
        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user?.user_metadata?.name || user?.email}
          </span>
          
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/profile">
              <User className="h-4 w-4" />
            </Link>
          </Button>
          
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <UserProfileMenu />
      </div>
    </header>
  );
}
