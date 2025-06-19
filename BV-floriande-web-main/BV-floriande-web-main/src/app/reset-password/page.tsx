/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/lib/authService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/lib/translations';

// Validatieschema voor wachtwoord herstel
const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Wachtwoord moet minimaal 8 tekens bevatten'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Wachtwoorden komen niet overeen',
  path: ['confirmPassword'],
});

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslation('dutch'); // Gebruik standaard Nederlands, kan worden gewijzigd op basis van gebruikersvoorkeuren
  
  useEffect(() => {
    // Controleer of er een token in de URL is
    if (!searchParams || !searchParams.get('token')) {
      setError('Ongeldige of verlopen link. Vraag een nieuwe link aan.');
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    try {
      resetPasswordSchema.parse({ password, confirmPassword });
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: { password?: string; confirmPassword?: string } = {};
        error.errors.forEach(err => {
          const path = err.path[0] as string;
          errors[path as 'password' | 'confirmPassword'] = err.message;
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Haal het token uit de URL
      const token = searchParams?.get('token');
      if (!token) {
        throw new Error('Geen resettoken gevonden. Vraag een nieuwe link aan.');
      }
      
      // Stel het token in de sessie in
      await authService.supabase.auth.setSession({
        access_token: token,
        refresh_token: token,
      });
      
      // Werk het wachtwoord bij
      await authService.updatePassword(password);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Er is een fout opgetreden bij het herstellen van je wachtwoord');
    } finally {
      setLoading(false);
    }
  };  const handleBackToHome = async () => {
    try {
      // Wis eventuele auth sessie voordat we teruggaan naar de startpagina
      await authService.supabase.auth.signOut();
    } catch (error) {
      console.log('Error signing out:', error);
    } finally {
      // Ga naar de startpagina
      router.push('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="absolute top-4 left-4">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 hover:bg-gray-100"
          onClick={handleBackToHome}
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar startpagina
        </Button>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 mr-2 text-blue-600" />
              <span className="text-2xl font-bold">BV Floriande</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">{t('resetPasswordTitle')}</CardTitle>
          <CardDescription className="text-center">
            Voer je nieuwe wachtwoord in om toegang te krijgen tot je account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  Je wachtwoord is succesvol gewijzigd! Je kunt nu inloggen met je nieuwe wachtwoord.
                </AlertDescription>
              </Alert>
              <Button className="w-full" onClick={() => router.push('/login')}>
                Ga naar inloggen
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
                <Label htmlFor="password">Nieuw wachtwoord</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-10 ${validationErrors.password ? 'border-destructive' : ''}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-destructive text-xs mt-1">{validationErrors.password}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Gebruik minimaal 8 tekens met een combinatie van letters, cijfers en symbolen.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-10 pr-10 ${validationErrors.confirmPassword ? 'border-destructive' : ''}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-destructive text-xs mt-1">{validationErrors.confirmPassword}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Bezig...' : t('resetPasswordButton')}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
