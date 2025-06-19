/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, User, MessageSquare, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { registrationService } from '@/lib/admin-service';

export default function RegisterRequestPage() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await registrationService.submitRequest(
        formData.email,
        formData.name,
        formData.message || undefined
      );
      setSuccess(true);
    } catch (err: any) {
      console.error('Error submitting request:', err);
      setError(err.message || 'Er is een fout opgetreden bij het versturen van je verzoek.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h1 className="text-2xl font-bold text-green-600 mb-2">Verzoek Verstuurd!</h1>
              <p className="text-gray-600 mb-4">
                Je registratieverzoek is succesvol verstuurd. Een beheerder zal je verzoek beoordelen en je via e-mail op de hoogte houden.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  <strong>E-mail:</strong> {formData.email}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Naam:</strong> {formData.name}
                </p>
              </div>
              <div className="mt-6">
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Terug naar startpagina
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant="ghost" className="flex items-center gap-2 hover:bg-blue-100">
            <ArrowLeft className="h-4 w-4" />
            Terug naar startpagina
          </Button>
        </Link>
      </div>
      
      <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Registratie Verzoek</CardTitle>
            <CardDescription className="text-center">
              Vraag toegang aan tot het BV Floriande trainersplatform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  E-mailadres
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  placeholder="jouw@email.nl"
                  required
                />
              </div>

              <div>
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Volledige naam
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  placeholder="Je volledige naam"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Bericht (optioneel)
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={handleInputChange('message')}
                  placeholder="Vertel kort waarom je toegang wilt tot het platform..."
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bijv: functie bij BV Floriande, groepen die je wilt trainen, etc.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Versturen...' : 'Verzoek Versturen'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Heb je al toegang? {' '}
                <Link href="/login" className="text-primary hover:underline">
                  Log hier in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
