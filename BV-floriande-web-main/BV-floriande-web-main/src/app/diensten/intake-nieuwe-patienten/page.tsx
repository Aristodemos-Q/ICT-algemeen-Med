/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Intake Nieuwe Patiënten - Service Information Page
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
  UserPlus,
  FileText,
  ClipboardCheck
} from 'lucide-react';

export default function IntakeNieuwePatiëntenPage() {
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
              <Users className="h-12 w-12 text-indigo-600" />
              <h1 className="text-4xl font-bold text-gray-900">Intake Nieuwe Patiënten</h1>
            </div>
            <p className="text-xl text-gray-600">Uitgebreide kennismaking voor nieuwe patiënten</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Wat is een intake-afspraak?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Een intake-afspraak is een uitgebreide eerste afspraak waarbij we elkaar leren kennen 
                  en een compleet beeld krijgen van uw medische geschiedenis, huidige gezondheid en 
                  persoonlijke behoeften.
                </p>
                <p className="text-gray-600">
                  Deze afspraak vormt de basis voor toekomstige zorgverlening en helpt ons om u de 
                  best mogelijk passende medische zorg te bieden.
                </p>
              </CardContent>
            </Card>

            {/* What We Discuss */}
            <Card>
              <CardHeader>
                <CardTitle>Wat bespreken we tijdens de intake?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-indigo-900">Medische geschiedenis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Eerdere ziekten</h4>
                            <p className="text-sm text-gray-600">Operaties, ziekenhuisopnames, chronische aandoeningen</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Medicijngebruik</h4>
                            <p className="text-sm text-gray-600">Huidige medicatie, allergieën, bijwerkingen</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Vaccinatiestatus</h4>
                            <p className="text-sm text-gray-600">Overzicht van ontvangen vaccinaties</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Familiegeschiedenis</h4>
                            <p className="text-sm text-gray-600">Erfelijke aandoeningen en risicofactoren</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Specialisten</h4>
                            <p className="text-sm text-gray-600">Behandelingen bij andere artsen</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Screenings</h4>
                            <p className="text-sm text-gray-600">Recente onderzoeken en controles</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-indigo-900">Leefstijl en persoonlijke situatie</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Heart className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Werk en wonen</h4>
                            <p className="text-sm text-gray-600">Werkstress, woonsituatie, sociale ondersteuning</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Heart className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Sport en beweging</h4>
                            <p className="text-sm text-gray-600">Activiteitenniveau en sportbeoefening</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Heart className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Voeding</h4>
                            <p className="text-sm text-gray-600">Eetgewoonten en dieetbeperkingen</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Heart className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Roken en alcohol</h4>
                            <p className="text-sm text-gray-600">Rookgedrag en alcoholconsumptie</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Heart className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Slaap en stress</h4>
                            <p className="text-sm text-gray-600">Slaappatroon en stressniveau</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Heart className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Relaties en gezin</h4>
                            <p className="text-sm text-gray-600">Gezinssituatie en belangrijke relaties</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-indigo-900">Zorgwensen en verwachtingen</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <UserPlus className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Communicatievoorkeur</h4>
                            <p className="text-sm text-gray-600">Hoe wilt u bereikt worden?</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <UserPlus className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Zorgdoelen</h4>
                            <p className="text-sm text-gray-600">Wat wilt u bereiken met uw gezondheid?</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <UserPlus className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Zorgen en angsten</h4>
                            <p className="text-sm text-gray-600">Specifieke aandachtspunten of zorgen</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <UserPlus className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Preventieve zorg</h4>
                            <p className="text-sm text-gray-600">Interesse in screening en preventie</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Process */}
            <Card>
              <CardHeader>
                <CardTitle>Hoe verloopt de intake?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 rounded-full p-2 text-indigo-600 font-bold text-sm min-w-8 h-8 flex items-center justify-center">1</div>
                    <div>
                      <h4 className="font-medium">Voorbereiding</h4>
                      <p className="text-sm text-gray-600">
                        U ontvangt vooraf een intakeformulier om in te vullen thuis
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 rounded-full p-2 text-indigo-600 font-bold text-sm min-w-8 h-8 flex items-center justify-center">2</div>
                    <div>
                      <h4 className="font-medium">Uitgebreid gesprek</h4>
                      <p className="text-sm text-gray-600">
                        Bespreking van medische geschiedenis en persoonlijke situatie
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 rounded-full p-2 text-indigo-600 font-bold text-sm min-w-8 h-8 flex items-center justify-center">3</div>
                    <div>
                      <h4 className="font-medium">Lichamelijk onderzoek</h4>
                      <p className="text-sm text-gray-600">
                        Algemene gezondheidscheck en meting van vitale functies
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 rounded-full p-2 text-indigo-600 font-bold text-sm min-w-8 h-8 flex items-center justify-center">4</div>
                    <div>
                      <h4 className="font-medium">Zorgplan opstellen</h4>
                      <p className="text-sm text-gray-600">
                        Samen maken we een persoonlijk zorgplan en afspraken voor de toekomst
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preparation */}
            <Card>
              <CardHeader>
                <CardTitle>Wat neemt u mee naar de intake?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Documenten:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Ingevuld intakeformulier</li>
                      <li>• Identiteitsbewijs</li>
                      <li>• Verzekeringsgegevens</li>
                      <li>• Medicijnlijst met dosering</li>
                      <li>• Recente uitslagen (bloedonderzoek, etc.)</li>
                      <li>• Brieven van specialisten</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Informatie:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Vragen die u heeft</li>
                      <li>• Familiegeschiedenis (ouders, grootouders)</li>
                      <li>• Contactgegevens vorige huisarts</li>
                      <li>• Werkgeversinformatie (indien relevant)</li>
                      <li>• Noodcontactpersoon</li>
                      <li>• Specifieke zorgen of doelen</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Appointment Info */}
            <Card className="bg-indigo-50">
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
                    <p className="text-sm text-gray-600">45 minuten</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Type</p>
                    <p className="text-sm text-gray-600">Uitgebreide intake</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Voor wie</p>
                    <p className="text-sm text-gray-600">Nieuwe patiënten</p>
                  </div>
                </div>
                <Badge variant="secondary" className="w-full justify-center">
                  Intake Nieuwe Patiënten
                </Badge>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg">Voordelen van intake</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm">Compleet medisch dossier</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm">Persoonlijke zorgbenadering</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm">Preventieve zorgplanning</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm">Betere toekomstige zorg</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm">Vroege risico-detectie</p>
                </div>
              </CardContent>
            </Card>

            {/* Registration Info */}
            <Card className="bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Inschrijving bij ons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Als nieuwe patiënt schrijft u zich eerst in bij onze praktijk. 
                  Na goedkeuring plannen we de intake-afspraak in.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Inschrijfformulier bevat:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Persoonlijke gegevens</li>
                    <li>• Verzekeringsgegevens</li>
                    <li>• Vorige huisarts</li>
                    <li>• Reden van inschrijving</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold mb-4">
                  Nieuwe patiënt worden?
                </h3>
                <p className="text-sm opacity-90 mb-6">
                  Start met uw intake-afspraak
                </p>
                <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 w-full">
                  <Link href="/login?redirect=/appointment-booking">
                    <Calendar className="h-5 w-5 mr-2" />
                    Intake Inplannen
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact & Inschrijving</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>023-5630350</span>
                </div>
                <p className="text-xs text-gray-500">
                  Voor inschrijving en intake-afspraken
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
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <ClipboardCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Let op</h4>
                    <p className="text-sm text-blue-800">
                      Een intake is verplicht voor alle nieuwe patiënten. 
                      Dit helpt ons u de beste zorg te geven vanaf het begin.
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
