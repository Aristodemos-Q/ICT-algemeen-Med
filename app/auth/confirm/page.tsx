'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, LoaderIcon } from 'lucide-react';

function ConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmUser = async () => {
      try {
        // Get token and type from URL parameters
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        const email = searchParams.get('email');

        if (!token) {
          setStatus('error');
          setMessage('Geen confirmation token gevonden in de URL.');
          return;
        }

        // Verify the email confirmation
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any || 'email',
        });

        if (error) {
          console.error('Confirmation error:', error);
          setStatus('error');
          setMessage(`Confirmatie mislukt: ${error.message}`);
          return;
        }

        if (data?.user) {
          setStatus('success');
          setMessage('Je email is succesvol bevestigd! Je wordt doorgestuurd naar de login pagina.');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login?confirmed=true');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Confirmatie mislukt: Geen gebruiker data ontvangen.');
        }
      } catch (err) {
        console.error('Unexpected error during confirmation:', err);
        setStatus('error');
        setMessage(`Onverwachte fout: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    confirmUser();
  }, [searchParams, router]);

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const handleGoToRegister = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Confirmatie
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We bevestigen je email adres...
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {status === 'loading' && (
            <Alert>
              <LoaderIcon className="h-4 w-4 animate-spin" />
              <AlertTitle>Bezig met bevestigen...</AlertTitle>
              <AlertDescription>
                Even geduld terwijl we je email bevestigen.
              </AlertDescription>
            </Alert>
          )}

          {status === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Confirmatie Succesvol!</AlertTitle>
              <AlertDescription className="text-green-700">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Confirmatie Mislukt</AlertTitle>
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status !== 'loading' && (
            <div className="flex flex-col space-y-3">
              {status === 'success' ? (
                <Button 
                  onClick={handleGoToLogin}
                  className="w-full"
                >
                  Ga naar Login
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleGoToLogin}
                    className="w-full"
                  >
                    Ga naar Login
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleGoToRegister}
                    className="w-full"
                  >
                    Registreer Opnieuw
                  </Button>
                </>
              )}
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  Problemen met confirmatie?
                </span>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Als je problemen hebt met de email confirmatie, controleer dan:
              </p>
              <ul className="mt-2 text-xs text-gray-500 list-disc list-inside text-left">
                <li>Je spam/junk mail folder</li>
                <li>Of de confirmation link niet verlopen is</li>
                <li>Of je het juiste email adres hebt gebruikt</li>
              </ul>
            </div>
          </div>        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <ConfirmForm />
    </Suspense>
  );
}
