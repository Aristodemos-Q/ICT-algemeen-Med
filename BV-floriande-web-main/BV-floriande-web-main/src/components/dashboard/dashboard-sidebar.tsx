/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Dashboard Sidebar Component
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  FileText, 
  Target, 
  MapPin, 
  CheckCircle, 
  Shield,
  Settings,
  Bell,
  Activity,
  TrendingUp,
  Clock,
  User,
  Mail,
  Heart,
  Pill,
  History,
  Home,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Activity,
    description: 'Mijn overzicht'
  },
  { 
    name: 'Mijn Afspraken', 
    href: '/dashboard/appointments', 
    icon: Calendar,
    description: 'Geplande afspraken'
  },
  { 
    name: 'Medisch Dossier', 
    href: '/dashboard/medical-records', 
    icon: FileText,
    description: 'Mijn gegevens'  
  },
  { 
    name: 'Medicijnen',
    href: '/dashboard/medications', 
    icon: Pill,
    description: 'Voorschriften'
  },
  { 
    name: 'Geschiedenis', 
    href: '/dashboard/history', 
    icon: History,
    description: 'Eerdere consulten'
  },
  { 
    name: 'Rapporten',
    href: '/dashboard/reports',
    icon: TrendingUp,
    description: 'Test resultaten'
  },
];

const adminNavigation = [
  { 
    name: 'Account Instellingen',
    href: '/dashboard/settings', 
    icon: Settings,
    description: 'Profiel beheren'
  },
  { 
    name: 'Privacy',
    href: '/dashboard/privacy', 
    icon: Shield,
    description: 'Privacy instellingen'
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
    // Check if user has admin privileges (for settings access)
  const hasAdminAccess = user?.user_metadata?.role === 'admin' || 
                  user?.email === 'qdelarambelje@gmail.com' ||
                  user?.email === 'admin@bvfloriande.nl';

  // For patients, show additional settings options if they have admin access
  const allNavigation = hasAdminAccess ? [...navigation, ...adminNavigation] : navigation;

  return (
    <div className="w-80 bg-white shadow-sm border-r min-h-screen">      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="bg-red-500 rounded-lg p-2 shadow-md">
            <Heart className="h-8 w-8 text-white" />
          </div>          <div>
            <h1 className="font-bold text-lg text-gray-900">MedCheck+</h1>
            <p className="text-xs text-muted-foreground">Patiënt Portal</p>
          </div>
        </Link>
      </div>      {/* User Info */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold">
            {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {user?.user_metadata?.name || user?.email}
            </p>            <p className="text-xs text-muted-foreground">
              {user?.user_metadata?.role === 'admin' ? 'Administrator' : 'Patiënt'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Navigatie
          </div>
          {allNavigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors group',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.name}</div>
                  <div className={cn(
                    "text-xs truncate",
                    isActive ? "text-white/80" : "text-muted-foreground"
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>      {/* Quick Stats */}
      <div className="p-4 border-t">
        <Card className="bg-gradient-to-br from-red-50 to-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Snel Overzicht
            </CardTitle>
          </CardHeader>          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Komende afspraken:</span>
              <Badge variant="secondary">2</Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Actieve medicijnen:</span>
              <Badge variant="outline">3</Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Laatste controle:</span>
              <Badge variant="default">5 dagen</Badge>
            </div>
          </CardContent>
        </Card>
      </div>      {/* Recent Activity */}
      <div className="p-4 border-t">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Recente Activiteit
        </h3>        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-muted-foreground">Afspraak bevestigd</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-muted-foreground">Test resultaat beschikbaar</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-muted-foreground">Medicijn herinnering</span>
          </div>
        </div>
      </div>      {/* Quick Actions */}
      <div className="p-4 border-t">
        <div className="space-y-2">
          <Button size="sm" className="w-full justify-start bg-red-500 hover:bg-red-600" asChild>
            <Link href="/dashboard/appointments">
              <Calendar className="h-4 w-4 mr-2" />
              Afspraak Maken
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="w-full justify-start" asChild>
            <Link href="/dashboard/medical-records">
              <FileText className="h-4 w-4 mr-2" />
              Mijn Dossier
            </Link>
          </Button>
        </div>
      </div>

      {/* Back to Home Button */}
      <div className="p-4 border-t">
        <Button size="sm" variant="ghost" className="w-full justify-start text-muted-foreground hover:text-gray-900" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
