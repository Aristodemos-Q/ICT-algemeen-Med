/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Mail } from 'lucide-react';
import { z } from 'zod';
import { authService } from '@/lib/authService';

// Validatieschema voor e-mailadres
const emailSchema = z.object({
  email: z.string().email('Voer een geldig e-mailadres in'),
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const router = useRouter();

  const validateEmail = (): boolean => {
    try {
      emailSchema.parse({ email });
      setValidationError('');
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error.errors[0]?.message || 'Ongeldig e-mailadres');
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { error } = await authService.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        // Verbeterde Nederlandse foutmeldingen
        if (error.message.includes('User not found')) {
          setError('Geen account gevonden met dit e-mailadres. Controleer of het e-mailadres correct is of registreer een nieuw account.');
        } else if (error.message.includes('Email rate limit exceeded')) {
          setError('Te veel aanvragen. Probeer het over een paar minuten opnieuw.');
        } else if (error.message.includes('Invalid email')) {
          setError('Ongeldig e-mailadres format.');
        } else {
          setError(error.message || 'Er is een fout opgetreden bij het versturen van de e-mail');
        }
        setLoading(false);
        return;
      }
      
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Er is een fout opgetreden bij het versturen van de e-mail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 mr-2 text-blue-600" />
              <span className="text-2xl font-bold">BV Floriande</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Wachtwoord herstellen</CardTitle>
          <CardDescription className="text-center">
            Voer je e-mailadres in om een link te ontvangen waarmee je je wachtwoord kunt herstellen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  We hebben een e-mail gestuurd naar {email} met instructies om je wachtwoord te herstellen.
                </AlertDescription>
              </Alert>
              <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Terug naar inloggen
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="naam@bvfloriande.nl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 ${validationError ? 'border-destructive' : ''}`}
                    disabled={loading}
                  />
                </div>
                {validationError && (
                  <p className="text-destructive text-xs mt-1">{validationError}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Bezig...' : 'Herstel wachtwoord'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:underline"
          >
            Terug naar inloggen
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
