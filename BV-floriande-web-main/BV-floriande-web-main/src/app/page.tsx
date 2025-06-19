/*
 * MedCheck+ Web Application  
 * © 2025 qdela. All rights reserved.
 * 
 * Modern web portal for general practice (huisartsenpraktijk)
 * Focused on werkproces 2 (automatisering) & 3 (databasebeheer)
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/authService';
import Link from 'next/link';
import { 
  Heart, 
  Clock, 
  Calendar, 
  User, 
  Shield, 
  Phone, 
  Star,
  CheckCircle,
  Users,
  FileText,
  Stethoscope,
  Pill,
  Activity
} from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  // Ensure we're client-side mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  // Show loading during auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Laden...</p>
          </div>
        </div>
      </div>
    );
  }

  // MedCheck+ Homepage voor patiënten en medewerkers
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
      {/* Header met navigatie */}
      <header className="py-4 bg-white shadow-lg border-b-2 border-blue-100">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-blue-600 rounded-lg p-2 mr-4 shadow-lg flex-shrink-0">
              <Heart className="h-12 w-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-blue-900">MedCheck+</h2>
              <p className="text-sm text-gray-600">Moderne Huisartsenpraktijk</p>
            </div>
          </div>
          <div className="space-x-4">
            {user ? (
              // Ingelogde gebruiker navigatie
              <>
                <Link 
                  href="/dashboard"
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    try {
                      await authService.supabase.auth.signOut();
                      router.refresh();
                    } catch (error) {
                      console.error('Logout error:', error);
                    }
                  }}
                  className="px-5 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                >
                  Uitloggen
                </button>
              </>
            ) : (
              // Niet-ingelogde gebruiker navigatie
              <>
                <Link 
                  href="/appointment-booking"
                  className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium shadow-sm"
                >
                  Afspraak Maken
                </Link>
                <Link 
                  href="/login"
                  className="px-5 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                >
                  Inloggen
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Hero section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-12 items-center mb-16">
          <div className="lg:w-1/2">
            <h1 className="text-5xl font-bold text-blue-900 mb-6 leading-tight">
              Welkom bij <span className="text-green-600">MedCheck+</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Uw moderne huisartsenpraktijk voor kwalitatieve zorg. 
              Maak eenvoudig een afspraak online of beheer uw medische gegevens veilig.
            </p>
            <div className="flex flex-wrap gap-4">
              {!user && (
                <Link 
                  href="/appointment-booking"
                  className="px-8 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all font-medium shadow-lg hover:shadow-xl hover:translate-y-[-2px]"
                >
                  <Calendar className="inline h-5 w-5 mr-2" />
                  Afspraak Maken
                </Link>
              )}
              <Link 
                href="#contact"
                className="px-8 py-3 rounded-lg bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 transition-all font-medium shadow-md hover:shadow-lg hover:translate-y-[-2px]"
              >
                <Phone className="inline h-5 w-5 mr-2" />
                Contact
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-[500px]">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-blue-200">
                {/* Medical header */}
                <div className="h-16 bg-gradient-to-r from-blue-600 to-green-600"></div>
                
                {/* Medical icon section */}
                <div className="py-16 px-4 flex items-center justify-center bg-white">
                  <div className="relative">
                    <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-24 h-24 text-blue-600" />
                    </div>
                    <div className="absolute -top-4 -right-4 bg-green-500 rounded-full p-3">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -bottom-4 -left-4 bg-blue-500 rounded-full p-3">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Medical footer */}
                <div className="h-16 bg-gradient-to-r from-green-600 to-blue-600"></div>
              </div>
              
              {/* Platform label */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white text-blue-900 px-10 py-3 rounded-full font-bold shadow-lg text-xl border-2 border-blue-600">
                Digitaal Zorgportaal
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick actions voor niet-ingelogde gebruikers */}
        {!user && (
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-600 mb-16">
            <h2 className="text-3xl font-semibold mb-8 text-blue-900 text-center">Snel en Eenvoudig</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/appointment-booking" className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 hover:shadow-md transition-all group">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-medium text-green-800 mb-2">Afspraak Maken</h3>
                <p className="text-green-700">
                  Plan online een afspraak bij onze huisartsen. Kies zelf de gewenste tijd en datum.
                </p>
              </Link>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white mb-4">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-medium text-blue-800 mb-2">Openingstijden</h3>
                <div className="text-blue-700 space-y-1 text-sm">
                  <div>Ma-Vr: 08:00 - 17:00</div>
                  <div>Zaterdag: 09:00 - 12:00</div>
                  <div>Spoed: 24/7 beschikbaar</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white mb-4">
                  <Phone className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-medium text-purple-800 mb-2">Contact</h3>
                <div className="text-purple-700 space-y-1 text-sm">
                  <div>📞 010-1234567</div>
                  <div>✉️ info@medcheckplus.nl</div>
                  <div>📍 Gezondheidsstraat 123</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onze diensten */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-blue-100">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-blue-900 text-center">Huisartsgeneeskunde</h3>
            <p className="text-gray-600 text-center">
              Volledige huisartszorg voor het hele gezin. Van preventie tot behandeling van acute klachten.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-green-100">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-green-800 text-center">Preventieve Zorg</h3>
            <p className="text-gray-600 text-center">
              Regelmatige controles, vaccinaties en gezondheidsscreenings voor optimale preventie.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-purple-100">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-purple-800 text-center">Digitale Services</h3>
            <p className="text-gray-600 text-center">
              Online afspraken, herhaalrecepten aanvragen en toegang tot uw medische gegevens.
            </p>
          </div>
        </div>
        
        {/* Waarom MedCheck+ */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 py-16 rounded-xl mb-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">
              Waarom kiezen voor <span className="text-green-600">MedCheck+</span>?
            </h2>
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <div className="bg-white p-8 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-blue-900">Moderne Zorgverlening</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Digitale afspraken plannen 24/7</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Elektronisch patiëntendossier (EPD)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Online toegang tot uitslagen en recepten</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Veilige communicatie met uw zorgteam</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-blue-900">Kwaliteit & Toegankelijkheid</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Ervaren huisartsen en specialisten</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Korte wachttijden voor afspraken</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Centrale locatie en goede bereikbaarheid</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>24/7 spoedlijn voor urgente zaken</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact sectie */}
        <div id="contact" className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 border-t-4 border-green-600">
          <h2 className="text-3xl font-semibold mb-8 text-blue-900 text-center">Contact & Bereikbaarheid</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-medium mb-4 text-blue-800">Praktijkgegevens</h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-blue-600 mr-3" />
                  <span>010-1234567 (centrale)</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-red-600 mr-3" />
                  <span>010-1234568 (spoed 24/7)</span>
                </div>
                <div className="flex items-center">
                  <span className="w-5 h-5 text-blue-600 mr-3">✉️</span>
                  <span>info@medcheckplus.nl</span>
                </div>
                <div className="flex items-center">
                  <span className="w-5 h-5 text-blue-600 mr-3">📍</span>
                  <span>Gezondheidsstraat 123<br />3011 AA Rotterdam</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-4 text-blue-800">Openingstijden</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Maandag - Vrijdag:</span>
                  <span className="font-medium">08:00 - 17:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Zaterdag:</span>
                  <span className="font-medium">09:00 - 12:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Zondag:</span>
                  <span className="font-medium">Gesloten</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span>Spoedlijn:</span>
                  <span className="font-medium text-red-600">24/7 bereikbaar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white rounded-lg p-2 mr-3 shadow-md flex-shrink-0">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <span className="font-bold text-lg">MedCheck+ - Moderne Huisartsenpraktijk</span>
            </div>
            <div className="text-sm opacity-80">
              © {new Date().getFullYear()} MedCheck+ - Alle rechten voorbehouden
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
