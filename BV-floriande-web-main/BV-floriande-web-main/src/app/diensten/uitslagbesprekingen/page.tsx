/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Uitslagbesprekingen - Service Information Page
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
  FileText,
  ClipboardList,
  TestTube
} from 'lucide-react';

export default function UitslagbesprekingenPage() {
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
              <FileText className="h-12 w-12 text-orange-600" />
              <h1 className="text-4xl font-bold text-gray-900">Uitslagbesprekingen</h1>
            </div>
            <p className="text-xl text-gray-600">Bespreking van laboratorium en onderzoeksresultaten</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Wat is een uitslagbespreking?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Een uitslagbespreking is een afspraak waarbij we samen de resultaten van uw 
                  laboratoriumonderzoek, beeldvormend onderzoek of andere diagnostische tests 
                  doorspreken en de betekenis ervan uitleggen.
                </p>
                <p className="text-gray-600">
                  We nemen de tijd om alle uitslagen duidelijk uit te leggen, uw vragen te 
                  beantwoorden en indien nodig vervolgstappen te bespreken.
                </p>
              </CardContent>
            </Card>

            {/* Types of Results */}
            <Card>
              <CardHeader>
                <CardTitle>Welke uitslagen bespreken we?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-orange-900">Laboratoriumonderzoek</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <TestTube className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Bloedonderzoek</h4>
                          <p className="text-sm text-gray-600">Volledige bloedwaarden, cholesterol, diabetes</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <TestTube className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Urineonderzoek</h4>
                          <p className="text-sm text-gray-600">Nierfunctie, infecties, diabetes controle</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <TestTube className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Hormoononderzoek</h4>
                          <p className="text-sm text-gray-600">Schildklier, geslachtshormonen, stress hormonen</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <TestTube className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Allergie-onderzoek</h4>
                          <p className="text-sm text-gray-600">IgE specifieke allergenen, voedselallergieën</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-orange-900">Beeldvormend onderzoek</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <ClipboardList className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Röntgenfoto's</h4>
                          <p className="text-sm text-gray-600">Botbreuken, longfoto's, gewrichten</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <ClipboardList className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Echo's</h4>
                          <p className="text-sm text-gray-600">Buikecho, schildklier echo, zwangerschap</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <ClipboardList className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">CT/MRI scans</h4>
                          <p className="text-sm text-gray-600">Gedetailleerde beeldvorming van organen</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <ClipboardList className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Specialistische onderzoeken</h4>
                          <p className="text-sm text-gray-600">Cardioloog, dermatoloog, andere specialisten</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-lg text-orange-900 mb-4">Screeningsprogramma's</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Bevolkingsonderzoek</h4>
                        <p className="text-sm text-gray-600">Borstkanker, baarmoederhalskanker, darmkanker</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Gezondheidscheck</h4>
                        <p className="text-sm text-gray-600">Preventieve onderzoeken en screening</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What to Expect */}
            <Card>
              <CardHeader>
                <CardTitle>Wat kunt u verwachten tijdens de bespreking?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 rounded-full p-2 text-orange-600 font-bold text-sm min-w-8 h-8 flex items-center justify-center">1</div>
                    <div>
                      <h4 className="font-medium">Uitslag doorspreken</h4>
                      <p className="text-sm text-gray-600">
                        We bespreken alle uitslagen systematisch en leggen uit wat de waarden betekenen
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 rounded-full p-2 text-orange-600 font-bold text-sm min-w-8 h-8 flex items-center justify-center">2</div>
                    <div>
                      <h4 className="font-medium">Vragen beantwoorden</h4>
                      <p className="text-sm text-gray-600">
                        Alle vragen worden uitgebreid beantwoord in begrijpelijke taal
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 rounded-full p-2 text-orange-600 font-bold text-sm min-w-8 h-8 flex items-center justify-center">3</div>
                    <div>
                      <h4 className="font-medium">Vervolgstappen bespreken</h4>
                      <p className="text-sm text-gray-600">
                        Indien nodig worden behandelingsmogelijkheden of vervolgonderzoek besproken
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 rounded-full p-2 text-orange-600 font-bold text-sm min-w-8 h-8 flex items-center justify-center">4</div>
                    <div>
                      <h4 className="font-medium">Schriftelijke samenvatting</h4>
                      <p className="text-sm text-gray-600">
                        U krijgt een kopie van de uitslagen en een samenvatting van de bespreking
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preparation Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Hoe bereidt u zich voor?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Voor het gesprek:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Noteer uw vragen vooraf</li>
                      <li>• Neem eventueel een vertrouwenspersoon mee</li>
                      <li>• Breng uw medicijnlijst mee</li>
                      <li>• Kom op tijd voor de afspraak</li>
                      <li>• Bedenk wat u nog meer wilt bespreken</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Mogelijke vragen:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Wat betekenen deze waarden?</li>
                      <li>• Zijn er vervolgstappen nodig?</li>
                      <li>• Moet ik mijn leefstijl aanpassen?</li>
                      <li>• Wanneer de volgende controle?</li>
                      <li>• Zijn er risico's of complicaties?</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Appointment Info */}
            <Card className="bg-orange-50">
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
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Type</p>
                    <p className="text-sm text-gray-600">Uitslagbespreking</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Voor wie</p>
                    <p className="text-sm text-gray-600">Na onderzoek</p>
                  </div>
                </div>
                <Badge variant="secondary" className="w-full justify-center">
                  Uitslagbespreking
                </Badge>
              </CardContent>
            </Card>

            {/* Result Options */}
            <Card className="bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Uitslagen ontvangen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm">Persoonlijke bespreking</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm">Telefonische uitslag</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm">Schriftelijke uitslag</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm">Digitale patiëntenportaal</p>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold mb-4">
                  Uitslag bespreken?
                </h3>
                <p className="text-sm opacity-90 mb-6">
                  Plan een uitslagbespreking in
                </p>
                <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-gray-100 w-full">
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
                  <span>023-5630350</span>
                </div>
                <p className="text-xs text-gray-500">
                  Voor vragen over uw uitslagen
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="tel:023-5630350">
                    <Phone className="h-4 w-4 mr-2" />
                    Direct Bellen
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Important Note */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Goede uitslagen</h4>
                    <p className="text-sm text-green-800">
                      Normale uitslagen krijgt u meestal telefonisch of schriftelijk door. 
                      Een afspraak is dan niet altijd nodig.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Spoedeisende uitslagen</h4>
                    <p className="text-sm text-red-800">
                      Bij urgente uitslagen nemen wij altijd direct contact met u op.
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
