/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Dashboard Layout for Medical Practice Management
 * Werkproces 2: Automatisering van afspraakprocessen
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  Heart,
  Stethoscope,
  ClipboardList,
  UserCog,
  Mail,
  BarChart3,
  Phone,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/dashboard/dashboard-header';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    roles: ['admin', 'doctor', 'assistant']
  },
  {
    name: 'Afspraken',
    href: '/dashboard/appointments',
    icon: Calendar,
    roles: ['admin', 'doctor', 'assistant']
  },
  {
    name: 'Afspraakverzoeken',
    href: '/dashboard/appointment-requests',
    icon: ClipboardList,
    roles: ['admin', 'doctor', 'assistant'],
    badge: true
  },
  {
    name: 'Patiënten',
    href: '/dashboard/patients',
    icon: Users,
    roles: ['admin', 'doctor', 'assistant']
  },
  {
    name: 'Medische Dossiers',
    href: '/dashboard/medical-records',
    icon: FileText,
    roles: ['admin', 'doctor']
  },
  {
    name: 'Recepten',
    href: '/dashboard/prescriptions',
    icon: Stethoscope,
    roles: ['admin', 'doctor']
  },
  {
    name: 'Agenda Beheer',
    href: '/dashboard/schedule-management',
    icon: Clock,
    roles: ['admin', 'doctor']
  },
  {
    name: 'E-mail Automation',
    href: '/dashboard/email-automation',
    icon: Mail,
    roles: ['admin', 'assistant']
  },
  {
    name: 'Gebruikersbeheer',
    href: '/dashboard/user-management',
    icon: UserCog,
    roles: ['admin']
  },
  {
    name: 'Instellingen',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['admin', 'doctor', 'assistant']
  }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const userRole = user?.user_metadata?.role || 'assistant';
  const filteredNavigation = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">MedCheck+</h1>
                <p className="text-xs text-gray-500">Medische Praktijk Portaal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.user_metadata?.name || user?.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {userRole === 'doctor' ? 'Arts' : 
                   userRole === 'assistant' ? 'Praktijkassistente' : 
                   userRole === 'admin' ? 'Beheerder' : userRole}
                </p>
              </div>
              <Button variant="outline" onClick={logout}>
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen border-r">
          <div className="p-4">
            <div className="space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                    {item.badge && (
                      <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                        Nieuw
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
