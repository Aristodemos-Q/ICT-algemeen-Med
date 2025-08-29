/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Homepage for medical practice management system
 * Provides patient portal and staff login access
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Calendar, Clock, Phone, MapPin, Users, Stethoscope, FileText } from 'lucide-react';
import { practiceLocationQueries, appointmentTypeQueries } from '@/lib/medcheck-queries';
import { PracticeLocation, AppointmentType } from '@/lib/medcheck-types';

export default function HomePage() {
  const [practiceInfo, setPracticeInfo] = useState<PracticeLocation | null>(null);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPracticeInfo() {
      try {
        const [location, types] = await Promise.all([
          practiceLocationQueries.getMainLocation(),
          appointmentTypeQueries.getActiveTypes()
        ]);
        
        setPracticeInfo(location);
        setAppointmentTypes(types);
      } catch (error) {
        console.error('Error loading practice info:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPracticeInfo();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 rounded-full p-4">
              <Heart className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            MedCheck<span className="text-blue-600">+</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Welkom bij {practiceInfo?.name || 'onze huisartsenpraktijk'}. 
            Maak eenvoudig online afspraken en beheer uw gezondheidsgegevens.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="/appointment-redirect">
                <Calendar className="w-5 h-5 mr-2" />
                Afspraak maken
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">
                <Users className="w-5 h-5 mr-2" />
                Inloggen (Personeel)
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Onze Diensten
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {appointmentTypes.slice(0, 4).map((type) => (
              <Card key={type.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div 
                    className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: type.color_code + '20', color: type.color_code }}
                  >
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-3">{type.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {type.duration_minutes} min
                    </span>
                    {type.price && (
                      <span className="font-semibold">€{type.price}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link href="/appointment-booking">
                Alle diensten bekijken
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Practice Information */}
      {practiceInfo && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Praktijkinformatie
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-semibold">{practiceInfo.name}</p>
                      <p className="text-gray-600">{practiceInfo.address}</p>
                      <p className="text-gray-600">
                        {practiceInfo.postal_code} {practiceInfo.city}
                      </p>
                    </div>
                  </div>
                  
                  {practiceInfo.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <a 
                        href={`tel:${practiceInfo.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {practiceInfo.phone}
                      </a>
                    </div>
                  )}
                  
                  {practiceInfo.opening_hours && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">Openingstijden</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(practiceInfo.opening_hours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="capitalize">{day}:</span>
                            <span>{hours.open} - {hours.close}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Snel een afspraak maken?
                </h3>
                <p className="text-gray-600 mb-6">
                  Maak eenvoudig online een afspraak voor uw bezoek aan onze praktijk.
                  U krijgt direct een bevestiging per e-mail.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/appointment-booking">
                    <Calendar className="w-5 h-5 mr-2" />
                    Afspraak maken
                  </Link>
                </Button>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-3">
                    Spoedeisende zaken? Bel ons direct:
                  </p>
                  {practiceInfo.phone && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`tel:${practiceInfo.phone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        {practiceInfo.phone}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Patient Portal Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Voordelen van online afspraken
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">24/7 Beschikbaar</h3>
              <p className="text-gray-600">
                Maak afspraken wanneer het u uitkomt, ook buiten kantooruren.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Direct Bevestiging</h3>
              <p className="text-gray-600">
                Krijg direct een bevestiging per e-mail met alle afspraakdetails.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Eenvoudig Proces</h3>
              <p className="text-gray-600">
                Vul eenvoudig uw gegevens in en kies de gewenste tijd.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">MedCheck+</h3>
              <p className="text-gray-400">
                Modern medisch praktijkbeheer voor betere patiëntenzorg.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Snel</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/appointment-booking" className="hover:text-white">
                    Afspraak maken
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white">
                    Personeel login
                  </Link>
                </li>
                <li>
                  <a href={`tel:${practiceInfo?.phone}`} className="hover:text-white">
                    Noodgeval: {practiceInfo?.phone}
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="text-gray-400 space-y-2">
                <p>{practiceInfo?.address}</p>
                <p>{practiceInfo?.postal_code} {practiceInfo?.city}</p>
                <p>{practiceInfo?.phone}</p>
                <p>{practiceInfo?.email}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MedCheck+. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
