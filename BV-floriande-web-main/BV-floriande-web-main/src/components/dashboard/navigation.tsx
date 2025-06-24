/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { 
  Target,
  Calendar,
  Users,
  CheckCircle,
  Settings,
  Shield,
  MapPin
} from 'lucide-react';

// Deze component wordt nu vervangen door DashboardSidebar
// Maar we houden de navigatie items voor backward compatibility

const navigation = [
  { 
    name: 'Oefeningen', 
    href: '/dashboard/trainer-dashboard', 
    icon: Target,
    description: 'Bijhouden van oefeningen en moeilijkheidsgraad'
  },
  { 
    name: 'Agenda', 
    href: '/dashboard/calendar', 
    icon: Calendar,
    description: 'Trainingsschema en sessies'
  },
  { 
    name: 'Sessies', 
    href: '/dashboard/schedule', 
    icon: Calendar,
    description: 'Gedetailleerd sessiebeheer'
  },
  { 
    name: 'Groepen', 
    href: '/dashboard/groups', 
    icon: Users,
    description: 'Beheer van trainingsgroepen'  
  },
  { 
    name: 'Aanwezigheid',
    href: '/dashboard/attendance', 
    icon: CheckCircle,
    description: 'Registratie van aanwezigheid'
  },
  { 
    name: 'Locaties',
    href: '/dashboard/locations',
    icon: MapPin,
    description: 'Bekijk beschikbare trainingslocaties'
  },
];

const adminNavigation = [
  { 
    name: 'Admin Dashboard',
    href: '/dashboard/admin', 
    icon: Shield,
    description: 'Gebruikersbeheer en systeeminstellingen'
  },
];

export function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.user_metadata?.role === 'admin' || 
                  user?.email === 'qdelarambelje@gmail.com' ||
                  user?.email === 'admin@bvfloriande.nl';

  // Combine navigation items
  const allNavigation = isAdmin ? [...navigation, ...adminNavigation] : navigation;

  return (
    <nav className="bg-primary text-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex space-x-6">
          {allNavigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-secondary text-white'
                    : 'border-transparent text-white/80 hover:text-white hover:border-white/30'
                )}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
