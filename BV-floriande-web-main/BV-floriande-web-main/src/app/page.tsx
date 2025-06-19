/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Homepage - Improved layout with sidebar
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  Stethoscope,
  ArrowRight,
  Bell,
  Activity,
  FileText,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react';

interface QuickStat {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'patient' | 'message';
  message: string;
  time: string;
  urgent?: boolean;
}

export default function HomePage() {
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data - in productie zou dit van de API komen
      const mockStats: QuickStat[] = [
        {
          label: 'Vandaag',
          value: '24',
          icon: <Calendar className="h-4 w-4" />,
          color: 'text-blue-600'
        },
        {
          label: 'Wachtend',
          value: '8',
          icon: <Clock className="h-4 w-4" />,
          color: 'text-orange-600'
        },
        {
          label: 'Patiënten',
          value: '1,247',
          icon: <Users className="h-4 w-4" />,
          color: 'text-green-600'
        },
        {
          label: 'Deze week',
          value: '156',
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'text-purple-600'
        }
      ];

      const mockActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'appointment',
          message: 'Nieuwe afspraak: Maria van der Berg',
          time: '5 min geleden',
          urgent: false
        },
        {
          id: '2',
          type: 'message',
          message: 'URGENT: Spoedverzoek Emma de Vries',
          time: '15 min geleden',
          urgent: true
        },
        {
          id: '3',
          type: 'patient',
          message: 'Nieuwe patiënt geregistreerd',
          time: '30 min geleden'
        },
        {
          id: '4',
          type: 'appointment',
          message: 'Afspraak voltooid: Lisa Bakker',
          time: '45 min geleden'
        }
      ];

      setQuickStats(mockStats);
      setRecentActivities(mockActivities);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'patient':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'message':
        return <Bell className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-12 w-12 text-red-500" />
            <h1 className="text-4xl font-bold text-gray-900">MedCheck+</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">Moderne Huisartsenpraktijk</p>
          <p className="text-gray-500">Uw gezondheid, onze prioriteit</p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Vandaag Overzicht
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={stat.color}>
                        {stat.icon}
                      </div>
                      <span className="text-sm text-gray-600">{stat.label}</span>
                    </div>
                    <span className="font-semibold">{stat.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Snelle Acties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/appointment-booking">
                    <Calendar className="h-4 w-4 mr-2" />
                    Nieuwe Afspraak
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/dashboard">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/dashboard/appointment-requests">
                    <FileText className="h-4 w-4 mr-2" />
                    Verzoeken
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/login">
                    <Users className="h-4 w-4 mr-2" />
                    Inloggen
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recente Activiteit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.slice(0, 4).map((activity) => (
                    <div key={activity.id} className={`flex items-start gap-3 p-2 rounded-lg ${
                      activity.urgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                    }`}>
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      {activity.urgent && (
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Practice Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>010-1234567</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>info@medcheckplus.nl</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p>Gezondheidsstraat 123</p>
                    <p>1234 AB Medstad</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opening Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Openingstijden
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Maandag - Donderdag</span>
                    <span>08:00 - 17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vrijdag</span>
                    <span>08:00 - 16:00</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Weekend</span>
                    <span>Gesloten</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Hero Section */}
            <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="mb-6 md:mb-0">
                    <h2 className="text-3xl font-bold mb-4">
                      Welkom bij MedCheck+
                    </h2>
                    <p className="text-xl opacity-90 mb-6">
                      Moderne zorg met persoonlijke aandacht
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                        <Link href="/appointment-booking">
                          <Calendar className="h-5 w-5 mr-2" />
                          Afspraak Maken
                        </Link>
                      </Button>
                      <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                        <Link href="/login">
                          Inloggen voor Medewerkers
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <Stethoscope className="h-32 w-32 opacity-20" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services Grid */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Onze Diensten</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-blue-600" />
                      Reguliere Consulten
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Standaard huisartsconsulten voor alle leeftijden
                    </p>
                    <Badge variant="secondary">15 minuten</Badge>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-600" />
                      Preventieve Zorg
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Vaccinaties, controles en gezondheidsscreenings
                    </p>
                    <Badge variant="secondary">Verschillende tijden</Badge>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-green-600" />
                      Telefonisch Consult
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Snelle medische vragen via de telefoon
                    </p>
                    <Badge variant="secondary">10 minuten</Badge>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-600" />
                      Kleine Ingrepen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Hechten, sterilisatie en andere kleine procedures
                    </p>
                    <Badge variant="secondary">30 minuten</Badge>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      Uitslagbesprekingen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Bespreking van laboratorium en onderzoeksresultaten
                    </p>
                    <Badge variant="secondary">15 minuten</Badge>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-indigo-600" />
                      Intake Nieuwe Patiënten
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Uitgebreide kennismaking voor nieuwe patiënten
                    </p>
                    <Badge variant="secondary">45 minuten</Badge>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Why Choose Us */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Waarom MedCheck+?</CardTitle>
                <CardDescription>
                  Moderne zorg met de persoonlijke touch van een traditionele huisartspraktijk
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Digitaal Vooruitstrevend</h3>
                        <p className="text-sm text-gray-600">Online afspraken maken en digitale communicatie</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Persoonlijke Zorg</h3>
                        <p className="text-sm text-gray-600">Vaste huisarts die u kent en begrijpt</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Moderne Faciliteiten</h3>
                        <p className="text-sm text-gray-600">Nieuwste medische apparatuur en technieken</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Flexibele Openingstijden</h3>
                        <p className="text-sm text-gray-600">Ook 's avonds en vroeg op de ochtend bereikbaar</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Snelle Service</h3>
                        <p className="text-sm text-gray-600">Korte wachttijden en efficiënte afhandeling</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Preventieve Focus</h3>
                        <p className="text-sm text-gray-600">Voorkomen is beter dan genezen</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <Card className="bg-gray-50">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Klaar om een afspraak te maken?
                </h2>
                <p className="text-gray-600 mb-6">
                  Maak eenvoudig online een afspraak of neem contact met ons op
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link href="/appointment-booking">
                      <Calendar className="h-5 w-5 mr-2" />
                      Online Afspraak Maken
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="tel:010-1234567">
                      <Phone className="h-5 w-5 mr-2" />
                      Bel: 010-1234567
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
