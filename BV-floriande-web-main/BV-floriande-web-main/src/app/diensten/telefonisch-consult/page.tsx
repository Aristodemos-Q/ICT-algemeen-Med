/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Telefonisch Consult - Service Information Page
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
  CheckCircle,
  Users,
  AlertCircle,
  MessageCircle,
  PhoneCall
} from 'lucide-react';

export default function TelefonischConsultPage() {
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
              <Phone className="h-12 w-12 text-green-600" />
              <h1 className="text-4xl font-bold text-gray-900">Telefonisch Consult</h1>
            </div>
            <p className="text-xl text-gray-600">Snelle medische vragen via de telefoon</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Wat is een telefonisch consult?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Een telefonisch consult is een gesprek met de huisarts via de telefoon waarbij u 
                  medische vragen kunt stellen en advies kunt krijgen zonder dat u naar de praktijk 
                  hoeft te komen.
                </p>
                <p className="text-gray-600">
                  Dit is ideaal voor eenvoudige medische vragen, opvolging van behandelingen, 
                  uitslagbesprekingen van onderzoek en situaties waarbij u niet mobiel bent.
                </p>
              </CardContent>
            </Card>

            {/* When to Use */}
            <Card>
              <CardHeader>
                <CardTitle>Wanneer een telefonisch consult?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-green-900">Geschikt voor:</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Medicatie vragen</h4>
                          <p className="text-sm text-gray-600">Bijwerkingen, dosering, interacties</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Uitslagbespreking</h4>
                          <p className="text-sm text-gray-600">Bloedonderzoek en andere uitslagen</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Follow-up gesprekken</h4>
                          <p className="text-sm text-gray-600">Opvolging van eerdere behandeling</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Eenvoudige klachten</h4>
                          <p className="text-sm text-gray-600">Vraag over bekende aandoening</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Preventief advies</h4>
                          <p className="text-sm text-gray-600">Gezondheidsadviezen en lifestyle tips</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-red-900">Niet geschikt voor:</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Spoedeisende situaties</h4>
                          <p className="text-sm text-gray-600">Bij noodgevallen bel 112</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Lichamelijk onderzoek</h4>
                          <p className="text-sm text-gray-600">Wanneer onderzoek nodig is</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Complexe nieuwe klachten</h4>
                          <p className="text-sm text-gray-600">Uitgebreide anamnese vereist</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Injecties/behandelingen</h4>
                          <p className="text-sm text-gray-600">Fysieke handelingen</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How it Works */}
            <Card>
              <CardHeader>
                <CardTitle>Hoe werkt het?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 rounded-full p-2 text-green-600 font-bold text-sm min-w-8 h-8 flex items-center justify-center">1</div>
                    <div>
                      <h4 className="font-medium">Afspraak maken</h4>
                      <p className="text-sm text-gray-600">
                        Maak online een afspraak voor een telefonisch consult of bel de praktijk
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 rounded-full p-2 text-green-600 font-bold text-sm min-w-8 h-8 flex items-center justify-center">2</div>
                    <div>
                      <h4 className="font-medium">Voorbereiding</h4>
                      <p className="text-sm text-gray-600">
                        Noteer uw vragen en zorg dat u medicatielijst bij de hand heeft
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 rounded-full p-2 text-green-600 font-bold text-sm min-w-8 h-8 flex items-center justify-center">3</div>
                    <div>
                      <h4 className="font-medium">Het gesprek</h4>
                      <p className="text-sm text-gray-600">
                        De huisarts belt u op het afgesproken tijdstip voor het consult
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 rounded-full p-2 text-green-600 font-bold text-sm min-w-8 h-8 flex items-center justify-center">4</div>
                    <div>
                      <h4 className="font-medium">Follow-up</h4>
                      <p className="text-sm text-gray-600">
                        Indien nodig wordt er een vervolgafspraak ingepland of recept klaargemaakt
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Appointment Info */}
            <Card className="bg-green-50">
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
                    <p className="text-sm text-gray-600">10 minuten</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Type</p>
                    <p className="text-sm text-gray-600">Telefonisch</p>
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
                  Telefonisch Consult
                </Badge>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Tips voor telefonisch consult</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm">Noteer uw vragen vooraf</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm">Houd medicatielijst bij de hand</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm">Zorg voor rustige omgeving</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm">Houd agenda bij de hand</p>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold mb-4">
                  Telefonisch consult inplannen?
                </h3>
                <p className="text-sm opacity-90 mb-6">
                  Snel en gemakkelijk een afspraak maken
                </p>
                <Button asChild size="lg" className="bg-white text-green-600 hover:bg-gray-100 w-full">
                  <Link href="/login?redirect=/appointment-booking">
                    <Phone className="h-5 w-5 mr-2" />
                    Afspraak Maken
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Direct Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Direct Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>010-1234567</span>
                </div>
                <p className="text-xs text-gray-500">
                  Voor spoedeisende vragen buiten afspraaktijden
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="tel:010-1234567">
                    <Phone className="h-4 w-4 mr-2" />
                    Direct Bellen
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Important Note */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Let op</h4>
                    <p className="text-sm text-yellow-800">
                      De huisarts bepaalt of uw vraag geschikt is voor telefonisch consult. 
                      Zo nodig wordt er een gewone afspraak ingepland.
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
