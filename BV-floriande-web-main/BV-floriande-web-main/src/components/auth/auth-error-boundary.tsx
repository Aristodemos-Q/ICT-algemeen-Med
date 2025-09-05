/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Auth Error Boundary
 * Catches and handles authentication errors gracefully
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  isAuthError: boolean;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isAuthError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is an auth-related error
    const isAuthError = error.message.includes('Auth session missing') ||
                       error.message.includes('AuthSessionMissingError') ||
                       error.message.includes('Invalid JWT') ||
                       error.message.includes('JWT expired');

    return {
      hasError: true,
      error,
      isAuthError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);
    
    // If it's an auth error, try to handle it gracefully
    if (this.state.isAuthError) {
      console.warn('Authentication error detected, clearing session');
      // Clear any stored session data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      }
    }
  }

  handleRefresh = () => {
    // Clear error state and reload
    this.setState({ hasError: false, error: undefined, isAuthError: false });
    window.location.reload();
  };

  handleGoToLogin = () => {
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Auth-specific error UI
      if (this.state.isAuthError) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-secondary/10 to-primary/10">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="text-center max-w-md mx-auto">
                <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Sessie verlopen
                </h1>
                <p className="text-gray-600 mb-6">
                  Je sessie is verlopen of ongeldig. Log opnieuw in om door te gaan.
                </p>
                <div className="space-y-3">
                  <Button onClick={this.handleGoToLogin} className="w-full">
                    Naar Login
                  </Button>
                  <Button variant="outline" onClick={this.handleRefresh} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Probeer opnieuw
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Generic error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-secondary/10 to-primary/10">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="text-center max-w-md mx-auto">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Er is iets misgegaan
              </h1>
              <p className="text-gray-600 mb-6">
                Er is een onverwachte fout opgetreden. Probeer de pagina te vernieuwen.
              </p>
              <div className="space-y-3">
                <Button onClick={this.handleRefresh} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Pagina vernieuwen
                </Button>
                <details className="text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Technische details
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                    {this.state.error?.message}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
