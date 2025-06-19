/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, User, Mail, Save } from 'lucide-react';
import { z } from 'zod';
import { userService } from '@/lib/bvf-services';

// Validatieschema voor profielformulier
const profileSchema = z.object({
  name: z.string().min(2, 'Naam moet minimaal 2 tekens bevatten'),
  email: z.string().email('Voer een geldig e-mailadres in'),
});

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ name?: string; email?: string }>({});
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const validateForm = (): boolean => {
    try {
      profileSchema.parse({ name, email });
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: { name?: string; email?: string } = {};
        error.errors.forEach(err => {
          const path = err.path[0] as string;
          errors[path as 'name' | 'email'] = err.message;
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) {
      return;
    }
    
    setIsSaving(true);
    setError('');
    setSuccess(false);
    
    try {
      await userService.updateUser(user.id, { name, email });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Er is een fout opgetreden bij het bijwerken van je profiel');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Mijn profiel</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Persoonlijke gegevens</CardTitle>
              <CardDescription>
                Beheer je profiel instellingen en contactgegevens.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-800">
                      Je profiel is succesvol bijgewerkt!
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Naam
                      </div>
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={validationErrors.name ? 'border-destructive' : ''}
                      disabled={isSaving}
                    />
                    {validationErrors.name && (
                      <p className="text-destructive text-xs mt-1">{validationErrors.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        E-mailadres
                      </div>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={validationErrors.email ? 'border-destructive' : ''}
                      disabled={isSaving}
                    />
                    {validationErrors.email && (
                      <p className="text-destructive text-xs mt-1">{validationErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="pt-4">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Opslaan...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Wijzigingen opslaan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
