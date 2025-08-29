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
  MapPin,
  User
} from 'lucide-react';

// Eenvoudige navigatie zonder admin complexiteit
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
  { 
    name: 'Mijn Account',
    href: '/account',
    icon: User,
    description: 'Beheer je accountinstellingen'
  },
];

export function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-primary text-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex space-x-6">
          {navigation.map((item) => {
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
