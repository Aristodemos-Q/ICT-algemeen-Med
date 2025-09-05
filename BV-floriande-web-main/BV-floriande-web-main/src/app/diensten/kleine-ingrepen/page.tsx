/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Kleine Ingrepen - Service Information Page
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
  Activity,
  Scissors,
  Bandage
} from 'lucide-react';

export default function KleineIngrepenPage() {
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
              <Activity className="h-12 w-12 text-purple-600" />
              <h1 className="text-4xl font-bold text-gray-900">Kleine Ingrepen</h1>
            </div>
            <p className="text-xl text-gray-600">Hechten, sterilisatie en andere kleine procedures</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Wat zijn kleine ingrepen?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Kleine ingrepen zijn medische procedures die ambulant (zonder opname) kunnen worden 
                  uitgevoerd in de huisartsenpraktijk. Deze ingrepen worden onder lokale verdoving 
                  uitgevoerd en vereisen meestal geen ziekenhuisopname.
                </p>
                <p className="text-gray-600">
                  Onze ervaren huisartsen hebben de juiste training en apparatuur om deze ingrepen 
                  veilig en effectief uit te voeren in een vertrouwde omgeving.
                </p>
              </CardContent>
            </Card>

            {/* Types of Procedures */}
            <Card>
              <CardHeader>
                <CardTitle>Welke ingrepen voeren wij uit?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-purple-900">Wondbehandeling</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Bandage className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Hechten van wonden</h4>
                          <p className="text-sm text-gray-600">Snijwonden, schaafwonden en andere verwondingen</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Bandage className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Hechtingen verwijderen</h4>
                          <p className="text-sm text-gray-600">Nazorg en controle van genezing</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Bandage className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Wondverzorging</h4>
                          <p className="text-sm text-gray-600">Professionele wondreiniging en verbandwisseling</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-purple-900">Huidaandoeningen</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Scissors className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Moedervlek verwijderen</h4>
                          <p className="text-sm text-gray-600">Verdachte of cosmetisch storende moedervlekken</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Scissors className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Wratten behandelen</h4>
                          <p className="text-sm text-gray-600">Cryotherapie (bevriezing) van wratten</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Scissors className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Huidtags verwijderen</h4>
                          <p className="text-sm text-gray-600">Kleine huiduitgroeiingen</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Scissors className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Atheroomcyste</h4>
                          <p className="text-sm text-gray-600">Verwijdering van kleine cysten</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-lg text-purple-900 mb-4">Overige procedures</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Activity className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Injecties</h4>
                        <p className="text-sm text-gray-600">Gewrichtsinjecties, corticosteroïden</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Activity className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Biopsieën</h4>
                        <p className="text-sm text-gray-600">Weefselonderzoek voor diagnose</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Activity className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Oorspoelingen</h4>
                        <p className="text-sm text-gray-600">Verwijdering van oorsmeer</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Activity className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Ingegroeide nagel</h4>
                        <p className="text-sm text-gray-600">Behandeling van ingegroeide teennagels</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Procedure Process */}
            <Card>
              <CardHeader>
                <CardTitle>Hoe verloopt een kleine ingreep?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 rounded-full p-2 text-purple-600 font-bold text-sm min-w-8 h-8 flex items-center justify-center">1</div>
                    <div>
                      <h4 className="font-medium">Consultatie</h4>
                      <p className="text-sm text-gray-600">
                        Eerst een gewoon consult om de ingreep te bespreken en in te plannen
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 rounded-full p-2 text-purple-600 font-bold text-sm min-w-8 h-8 flex items-center justify-center">2</div>
                    <div>
                      <h4 className="font-medium">Voorbereiding</h4>
                      <p className="text-sm text-gray-600">
                        Uitleg over de procedure en eventuele voorbereiding thuis
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 rounded-full p-2 text-purple-600 font-bold text-sm min-w-8 h-8 flex items-center justify-center">3</div>
                    <div>
                      <h4 className="font-medium">De ingreep</h4>
                      <p className="text-sm text-gray-600">
                        Lokale verdoving en uitvoering van de procedure (30 minuten)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 rounded-full p-2 text-purple-600 font-bold text-sm min-w-8 h-8 flex items-center justify-center">4</div>
                    <div>
                      <h4 className="font-medium">Nazorg</h4>
                      <p className="text-sm text-gray-600">
                        Instructies voor thuiszorg en eventuele controleafspraak
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preparation and Aftercare */}
            <Card>
              <CardHeader>
                <CardTitle>Voorbereiding en nazorg</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Voor de ingreep:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Medicijngebruik doorgeven</li>
                      <li>• Bloedverdunners mogelijk stoppen</li>
                      <li>• Comfortabele kleding dragen</li>
                      <li>• Eventueel vervoer regelen</li>
                      <li>• Vragen voorbereiden</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Na de ingreep:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Wond droog en schoon houden</li>
                      <li>• Verbandwisselinstructies opvolgen</li>
                      <li>• Tekenen van infectie herkennen</li>
                      <li>• Pijnmedicatie indien nodig</li>
                      <li>• Controleafspraak naleven</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Appointment Info */}
            <Card className="bg-purple-50">
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
                    <p className="text-sm text-gray-600">30 minuten</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Type</p>
                    <p className="text-sm text-gray-600">Chirurgische ingreep</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Voor wie</p>
                    <p className="text-sm text-gray-600">Na consultatie</p>
                  </div>
                </div>
                <Badge variant="secondary" className="w-full justify-center">
                  Kleine Ingreep
                </Badge>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg">Voordelen bij ons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm">Vertrouwde omgeving</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm">Geen ziekenhuiskosten</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm">Kortere wachttijden</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm">Persoonlijke nazorg</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm">Bekende behandelaar</p>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold mb-4">
                  Kleine ingreep nodig?
                </h3>
                <p className="text-sm opacity-90 mb-6">
                  Plan eerst een consult in
                </p>
                <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-gray-100 w-full">
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
                <CardTitle className="text-lg">Vragen?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>023-5630350</span>
                </div>
                <p className="text-xs text-gray-500">
                  Bel voor vragen over kleine ingrepen
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
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900">Belangrijk</h4>
                    <p className="text-sm text-amber-800">
                      Niet alle ingrepen kunnen in de huisartsenpraktijk. 
                      Complexere procedures verwijzen we door naar het ziekenhuis.
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
