/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Preventieve Zorg - Service Information Page
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Calendar, 
  Clock, 
  Phone, 
  ArrowLeft,
  Shield,
  CheckCircle,
  Users,
  AlertCircle,
  Activity
} from 'lucide-react';

export default function PreventieveZorgPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="outline" className="mb-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar Home
            </Link>
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="h-12 w-12 text-red-600" />
              <h1 className="text-4xl font-bold text-gray-900">Preventieve Zorg</h1>
            </div>
            <p className="text-xl text-gray-600">Vaccinaties, controles en gezondheidsscreenings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Wat is preventieve zorg?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Preventieve zorg richt zich op het voorkomen van ziekten en het vroeg opsporen van 
                  gezondheidsproblemen. Door regelmatige controles en vaccinaties blijft u gezond en 
                  kunnen we eventuele problemen tijdig signaleren.
                </p>
                <p className="text-gray-600">
                  Voorkomen is beter dan genezen. Daarom investeren we bij MedCheck+ in uitgebreide 
                  preventieve zorgprogramma's die zijn afgestemd op uw leeftijd en risicoprofielen.
                </p>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Onze preventieve diensten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900">Vaccinaties</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Griepvaccinatie</h4>
                          <p className="text-sm text-gray-600">Jaarlijkse bescherming tegen seizoensgriep</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">COVID-19 vaccinatie</h4>
                          <p className="text-sm text-gray-600">Actuele bescherming volgens RIVM richtlijnen</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Reisvaccinaties</h4>
                          <p className="text-sm text-gray-600">Bescherming voor buitenlandse reizen</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Hepatitis B</h4>
                          <p className="text-sm text-gray-600">Voor risicogroepen en zorgmedewerkers</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900">Gezondheidscontroles</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Bloeddrukcontrole</h4>
                          <p className="text-sm text-gray-600">Regelmatige monitoring van uw bloeddruk</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Cholesteroltest</h4>
                          <p className="text-sm text-gray-600">Controle van uw cholesterolgehalte</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Diabetesscreening</h4>
                          <p className="text-sm text-gray-600">Vroege opsporing van diabetes</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Gewichtscontrole</h4>
                          <p className="text-sm text-gray-600">BMI en gezonde leefstijl adviezen</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Age-based Programs */}
            <Card>
              <CardHeader>
                <CardTitle>Leeftijdsspecifieke programma's</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-blue-900">20-40 jaar</h4>
                    <p className="text-sm text-gray-600">
                      Basis gezondheidscheck, seksuele gezondheid screening, 
                      leefstijladviezen en fertiliteitsconsulten.
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-green-900">40-65 jaar</h4>
                    <p className="text-sm text-gray-600">
                      Uitgebreide gezondheidscheck, cardiovasculaire risico-evaluatie, 
                      kankerscreening en hormonale controles.
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-purple-900">65+ jaar</h4>
                    <p className="text-sm text-gray-600">
                      Geriatrische screening, valpreventie, cognitieve functietests 
                      en medicatiereview.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Appointment Info */}
            <Card className="bg-red-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Afspraak Informatie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Duur</p>
                    <p className="text-sm text-gray-600">Verschillende tijden</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Voor wie</p>
                    <p className="text-sm text-gray-600">Alle leeftijden</p>
                  </div>
                </div>
                <Badge variant="secondary" className="w-full justify-center">
                  Preventieve Zorg
                </Badge>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg">Voordelen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm">Vroege opsporing van ziekten</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm">Kosteneffectieve zorg</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm">Betere levenskwaliteit</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm">Langere levensverwachting</p>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold mb-4">
                  Start met preventieve zorg
                </h3>
                <p className="text-sm opacity-90 mb-6">
                  Plan uw gezondheidscheck in
                </p>
                <Button asChild size="lg" className="bg-white text-red-600 hover:bg-gray-100 w-full">
                  <Link href="/appointment-booking">
                    <Calendar className="h-5 w-5 mr-2" />
                    Afspraak Maken
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>010-1234567</span>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="tel:010-1234567">
                    <Phone className="h-4 w-4 mr-2" />
                    Direct Bellen
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
