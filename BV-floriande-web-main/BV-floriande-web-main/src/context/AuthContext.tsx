/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { authService } from '@/lib/authService';
import { useRouter } from 'next/navigation';
import { retryRequest } from '@/utils/retry-helper';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Admin check function
  const checkIsAdmin = (currentUser: User | null): boolean => {
    if (!currentUser) return false;
    
    // Check multiple ways for admin status
    return currentUser.user_metadata?.role === 'admin' || 
           currentUser.email === 'qdelarambelje@gmail.com' ||
           currentUser.email === 'admin@bvfloriande.nl';
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await authService.supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError('Failed to initialize authentication');
        } else {
          if (mounted) {
            setUser(session?.user ?? null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setError('Failed to initialize authentication');
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };    // Initialize auth immediately
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = authService.supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', { event, hasUser: !!session?.user, userEmail: session?.user?.email });
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false); // Set loading to false after user state is updated
            // Handle redirects based on auth state
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('✅ SIGNED_IN event - redirecting to homepage');
            // Small delay to ensure state is fully updated
            setTimeout(() => {
              router.push('/');
            }, 150);
          } else if (event === 'SIGNED_OUT') {
            console.log('🚪 SIGNED_OUT event - redirecting to login');
            router.push('/login');
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('AuthContext login attempt:', { email });
      
      // First test basic connectivity
      try {
        const testResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          },
        });
        console.log('Connectivity test successful:', testResponse.status);
      } catch (connectivityError) {
        console.error('Connectivity test failed:', connectivityError);
        throw new Error('Kan geen verbinding maken met de server. Controleer je internetverbinding.');
      }
      
      // Use retry mechanism for network resilience
      const loginResult = await retryRequest(async () => {
        return await authService.supabase.auth.signInWithPassword({
          email,
          password,
        });
      }, 3, 1000);
      
      const { data, error } = loginResult;

      console.log('AuthContext login response:', { 
        hasUser: !!data.user, 
        userEmail: data.user?.email,
        hasSession: !!data.session,
        errorMessage: error?.message 
      });

      if (error) {
        console.error('Login error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });

        // Nederlandse foutmeldingen
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Ongeldige inloggegevens. Controleer je e-mailadres en wachtwoord.');
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Te veel inlogpogingen. Probeer het over een paar minuten opnieuw.');
        } else if (error.message.includes('User not found')) {
          throw new Error('Geen account gevonden met dit e-mailadres. Registreer eerst een account.');
        } else if (error.message.includes('Invalid email')) {
          throw new Error('Ongeldig e-mailadres format.');
        } else if (error.message.includes('Signup is disabled')) {
          throw new Error('Registratie is momenteel uitgeschakeld. Neem contact op met de beheerder.');
        } else if (error.message.includes('Failed to fetch') || error.message.includes('Network connection failed')) {
          throw new Error('Netwerkverbinding mislukt. Controleer je internetverbinding en probeer opnieuw.');
        } else {
          throw new Error(`Login fout: ${error.message}`);
        }
      }

      if (!data.user) {
        throw new Error('Login failed: No user data received');
      }

      console.log('✅ Login successful, setting user:', data.user.email);
      setUser(data.user);
      
      // Note: Redirect will be handled by onAuthStateChange handler
      console.log('⏳ Waiting for onAuthStateChange to handle redirect...');
      
      // Don't set loading to false here - let onAuthStateChange handle it
      // to prevent race condition with ProtectedRoute
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      console.error('AuthContext login error:', errorMessage);
      setError(errorMessage);
      setLoading(false); // Only set loading false on error
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      const { error } = await authService.supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      router.push('/login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    error,
    clearError,
    isAdmin: checkIsAdmin(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
