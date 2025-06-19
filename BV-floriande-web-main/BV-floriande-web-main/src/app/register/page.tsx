/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

// Registratiepagina voor nieuwe gebruikers
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { authService } from '@/lib/authService';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);  useEffect(() => {
    // Redirect to homepage if user is already logged in
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Naam is verplicht');
      return false;
    }
    if (!formData.email.trim()) {
      setError('E-mailadres is verplicht');
      return false;
    }
    if (!formData.password) {
      setError('Wachtwoord is verplicht');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens lang zijn');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);    try {
      const { data } = await authService.signUp(
        formData.email,
        formData.password,
        {
          name: formData.name,
          role: 'trainer' // Default role
        }
      );

      if (data.user) {
        setSuccess('Account succesvol aangemaakt! Je wordt automatisch ingelogd...');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });        // Direct doorsturen naar homepage (geen email verificatie)
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Er ging iets mis bij het aanmaken van je account';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
              Account aanmaken
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Word lid van het BV Floriande trainers platform
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Registreren</CardTitle>
              <CardDescription>
                Maak een account aan om toegang te krijgen tot het trainingsplatform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Volledige naam
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder="Je volledige naam"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    E-mailadres
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder="jouw@email.com"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Wachtwoord
                  </Label>
                  <div className="mt-1 relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pr-10"
                      placeholder="Minimaal 8 tekens"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Wachtwoord bevestigen
                  </Label>
                  <div className="mt-1 relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pr-10"
                      placeholder="Herhaal je wachtwoord"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Verberg wachtwoord bevestiging" : "Toon wachtwoord bevestiging"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Account aanmaken...
                      </>
                    ) : (
                      'Account aanmaken'
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Heb je al een account?{' '}
                    <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                      Log hier in
                    </Link>
                  </p>
                </div>

                <div className="text-center">
                  <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                    ← Terug naar hoofdpagina
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
