/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Cpu, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import LoginForm from './components/login-form';
import { checkSupabaseConnection } from '@/utils/auth-helpers';
import { authService } from '@/lib/authService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  useEffect(() => {
    // Verwijder email confirmation berichten (niet meer nodig)
    
    // Check Supabase connection on page load
    async function checkConnection() {      
      try {
        console.log('Checking Supabase connection with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        const isConnected = await checkSupabaseConnection();
        console.log('Connection check result:', isConnected);
        if (!isConnected) {
          console.error('Supabase connection failed - no response from server');
          setConnectionError('Database verbinding mislukt. Server reageert niet.');
        }
      } catch (err) {
        console.error('Connection check error:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          error: err
        });
        
        let errorMessage = 'Database verbindingsfout. ';
        
        if (err instanceof Error) {
          errorMessage += err.message;
          console.log('Detailed error:', {
            name: err.name,
            stack: err.stack
          });
        }
        
        setConnectionError(errorMessage);
      }
    }
      checkConnection();    // Redirect to homepage if user is already logged in
    if (user) {
      console.log('User session found:', user);
      router.replace('/');
    }
  }, [user, router, searchParams]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Als gebruiker al ingelogd is, toon loading terwijl we redirecten
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Inloggen bij BV Floriande
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Trainers platform voor het bijhouden van oefeningen
            </p>
          </div>

          {confirmationMessage && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                {confirmationMessage}
              </AlertDescription>
            </Alert>
          )}

          {connectionError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>{connectionError}</AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Welkom terug</CardTitle>
                <CardDescription>
                  Voer je inloggegevens in om toegang te krijgen tot het trainingsplatform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm />
              </CardContent>
            </Card>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Geen account? {' '}
              <Link href="/register" className="text-primary hover:underline">
                Registreer hier
              </Link>
            </p>
          </div>          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => router.push('/')}
              className="text-sm"
            >
              <ArrowLeft className="inline-block mr-1" />
              Terug naar startpagina
            </Button>
          </div>        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
