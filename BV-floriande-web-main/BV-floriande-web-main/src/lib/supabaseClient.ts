/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

import { createClient } from '@supabase/supabase-js';

// Debug environment variables
console.log('=== SUPABASE CLIENT INITIALIZATION ===');
console.log('All env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));
console.log('NODE_ENV:', process.env.NODE_ENV);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET (' + supabaseUrl.substring(0, 20) + '...)' : 'MISSING');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET (' + supabaseAnonKey.substring(0, 20) + '...)' : 'MISSING');

// More graceful error handling for better development experience
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing!');
  console.error('Current environment:', process.env.NODE_ENV);
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
  console.error('Please check your .env.local file to ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
  console.error('Make sure to restart your development server after adding environment variables.');
  
  // Don't provide fallback - throw error instead
  throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Please set them in your .env.local file and restart the server.');
}

// Validate URL format
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  console.error('Invalid Supabase URL format!');
  throw new Error('Supabase URL must start with http:// or https://');
}

// Validate API key format (should be a JWT token)
if (supabaseAnonKey && (!supabaseAnonKey.startsWith('ey') || (supabaseAnonKey.match(/\./g) || []).length !== 2)) {
  console.error('Invalid Supabase API key format!');
  console.error('API key should be a JWT token (start with "ey" and contain two periods)');
  if (process.env.NODE_ENV === 'development') {
    console.warn('Continuing with invalid key format, but authentication will likely fail');
  } else {
    throw new Error('Invalid Supabase API key format. Please check your .env.local file.');
  }
}

// Disable Supabase auth debugging completely
if (typeof window !== 'undefined') {
  // Override console methods specifically for GoTrueClient logs
  const originalLog = console.log;
  const originalWarn = console.warn;
  
  console.log = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('GoTrueClient') || message.includes('#_')) {
      return; // Skip GoTrueClient debug logs
    }
    originalLog.apply(console, args);
  };
  
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('GoTrueClient') || message.includes('#_')) {
      return; // Skip GoTrueClient debug logs
    }
    originalWarn.apply(console, args);
  };
}

// Create the Supabase client with better error handling and options
export const supabase = createClient(
  supabaseUrl!, 
  supabaseAnonKey!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      debug: false, // Disable auth debugging to reduce console noise
      flowType: 'pkce' // Use PKCE flow for better security
    },
    global: {
      headers: {
        'X-Client-Info': 'bv-floriande-web'
      },
      fetch: async (url, options = {}) => {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        try {
          // Enhanced fetch with better error handling
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            // Add additional headers for better compatibility
            headers: {
              'Content-Type': 'application/json',
              ...options.headers,
            },
          });
          
          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          
          if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timeout - please check your internet connection');
          }
          
          // Handle common network errors
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw new Error('Network connection failed. Please check your internet connection and try again.');
          }
          
          // Handle auth session errors gracefully
          if (error instanceof Error && error.message.includes('Auth session missing')) {
            console.warn('Auth session missing, user may need to login again');
            // Create a proper error response that won't crash the app
            return new Response(JSON.stringify({ 
              error: 'Auth session missing',
              message: 'Please login again'
            }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          throw error;
        }
      }
    },
    db: {
      schema: 'public'
    }
  }
);