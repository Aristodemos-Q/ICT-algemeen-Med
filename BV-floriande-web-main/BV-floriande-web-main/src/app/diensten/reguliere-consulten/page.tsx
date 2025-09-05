/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Reguliere Consulten - Service Information Page
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
  Stethoscope,
  CheckCircle,
  Users,
  AlertCircle
} from 'lucide-react';

export default function ReguliereConsultenPage() {
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
              <Stethoscope className="h-12 w-12 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Reguliere Consulten</h1>
            </div>
            <p className="text-xl text-gray-600">Standaard huisartsconsulten voor alle leeftijden</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Wat zijn reguliere consulten?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Reguliere consulten zijn standaard afspraken bij de huisarts voor algemene medische zorg. 
                  Tijdens deze consulten kunt u terecht met alle dagelijkse gezondheidsklachten en vragen.
                </p>
                <p className="text-gray-600">
                  Onze ervaren huisartsen nemen de tijd om naar uw klachten te luisteren, een grondige 
                  anamnese af te nemen en indien nodig lichamelijk onderzoek uit te voeren.
                </p>
              </CardContent>
            </Card>

            {/* What to Expect */}
            <Card>
              <CardHeader>
                <CardTitle>Wat kunt u verwachten?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Uitgebreide Anamnese</h3>
                      <p className="text-sm text-gray-600">Grondige bespreking van uw klachten en medische geschiedenis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Lichamelijk Onderzoek</h3>
                      <p className="text-sm text-gray-600">Indien nodig wordt een passend lichamelijk onderzoek uitgevoerd</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Behandelplan</h3>
                      <p className="text-sm text-gray-600">Samen stellen we een passend behandelplan op</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Follow-up</h3>
                      <p className="text-sm text-gray-600">Indien nodig plannen we vervolgafspraken</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Issues */}
            <Card>
              <CardHeader>
                <CardTitle>Veel voorkomende klachten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Algemene klachten:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Verkoudheid en griep</li>
                      <li>• Hoofdpijn</li>
                      <li>• Buikpijn</li>
                      <li>• Rugpijn</li>
                      <li>• Huidproblemen</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Chronische aandoeningen:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Diabetes</li>
                      <li>• Hoge bloeddruk</li>
                      <li>• Astma/COPD</li>
                      <li>• Cholesterol</li>
                      <li>• Schildklieraandoeningen</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Appointment Info */}
            <Card className="bg-blue-50">
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
                    <p className="text-sm text-gray-600">15 minuten</p>
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
                  Standaard Consult
                </Badge>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold mb-4">
                  Klaar voor een afspraak?
                </h3>
                <p className="text-sm opacity-90 mb-6">
                  Maak eenvoudig online een afspraak
                </p>
                <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full">
                  <Link href="/login?redirect=/appointment-booking">
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

            {/* Important Note */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-900">Spoed?</h4>
                    <p className="text-sm text-orange-800">
                      Bij spoedeisende situaties belt u direct 112 of de huisartsenpost.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
