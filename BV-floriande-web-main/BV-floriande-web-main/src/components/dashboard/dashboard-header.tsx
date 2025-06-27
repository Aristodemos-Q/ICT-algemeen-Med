/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Dashboard Header Component
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell, Menu, Heart, ArrowLeft } from 'lucide-react';
import UserProfileMenu from './user-profile-menu';
import NotificationsDropdown from './notifications-dropdown';

interface DashboardHeaderProps {
  toggleSidebar?: () => void;
  showMobileToggle?: boolean;
}

export default function DashboardHeader({ toggleSidebar, showMobileToggle = false }: DashboardHeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);

  const handleBackClick = () => {
    router.back();
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-4 sm:px-6">
      {/* Back Button */}
      <Button variant="ghost" size="icon" className="shrink-0" onClick={handleBackClick}>
        <ArrowLeft className="h-5 w-5" />
        <span className="sr-only">Terug naar vorige pagina</span>
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
        <div className="relative" ref={notificationRef}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={toggleNotifications}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
          
          <NotificationsDropdown 
            isOpen={showNotifications} 
            onClose={() => setShowNotifications(false)}
            onUnreadCountChange={setUnreadCount}
          />
        </div>
        
        <UserProfileMenu />
      </div>
    </header>
  );
}
