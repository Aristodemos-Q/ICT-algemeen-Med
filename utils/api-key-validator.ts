/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

import { supabase } from '@/lib/supabaseClient';

/**
 * Validates the Supabase API key format and tests connection
 * @returns A diagnostic report about the API key and connection status
 */
export async function validateApiKey(): Promise<{
  isValid: boolean;
  formatValid: boolean;
  connectionValid: boolean;
  message: string;
  details?: Record<string, any>;
}> {
  try {
    // Get API key and URL from environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Check if credentials are set
    if (!url || !key) {
      return {
        isValid: false,
        formatValid: false,
        connectionValid: false,
        message: 'API key or URL is missing in environment variables',
      };
    }
    
    // Validate key format - should be a JWT token (starts with ey and has two periods)
    const formatValid = key.startsWith('ey') && (key.match(/\./g) || []).length === 2;
    if (!formatValid) {
      return {
        isValid: false,
        formatValid: false,
        connectionValid: false,
        message: 'API key format is invalid - should be a JWT token',
        details: {
          startsWithEy: key.startsWith('ey'),
          periodCount: (key.match(/\./g) || []).length,
          keyLength: key.length,
        }
      };
    }
    
    // Test connection using auth service
    try {
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        return {
          isValid: false,
          formatValid: true,
          connectionValid: false,
          message: `API key format is valid but connection failed: ${error.message}`,
          details: {
            error: error.message,
            errorCode: error.code,
          }
        };
      }
      
      // Try a simple ping to verify database access
      const { error: pingError } = await supabase.rpc('ping');
      
      if (pingError) {
        return {
          isValid: true,
          formatValid: true,
          connectionValid: true,
          message: 'API key is valid but database functions might not be accessible',
          details: {
            pingError: pingError.message,
          }
        };
      }
      
      return {
        isValid: true,
        formatValid: true,
        connectionValid: true,
        message: 'API key is valid and working correctly',
      };
    } catch (error) {
      return {
        isValid: false,
        formatValid: true,
        connectionValid: false,
        message: `Error testing connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      };
    }
  } catch (error) {
    return {
      isValid: false,
      formatValid: false,
      connectionValid: false,
      message: `Unexpected error validating API key: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    };
  }
}

/**
 * Check if the API key has the correct format
 * This is useful to quickly validate the key without making API calls
 */
export function checkApiKeyFormat(key?: string): {
  isValid: boolean;
  details: {
    length: number;
    startsWithEy: boolean;
    hasTwoPeriods: boolean;
    hasThreeParts: boolean;
  };
  message: string;
} {
  // Use the provided key or get from environment
  const apiKey = key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  const startsWithEy = apiKey.startsWith('ey');
  const periodCount = (apiKey.match(/\./g) || []).length;
  const hasTwoPeriods = periodCount === 2;
  const parts = apiKey.split('.');
  const hasThreeParts = parts.length === 3;
  
  // Validate key format
  const isValid = startsWithEy && hasTwoPeriods && hasThreeParts && apiKey.length > 100;
  
  let message = isValid 
    ? 'API key format appears valid' 
    : 'API key format is invalid';
    
  // Add specific issues to the message
  if (!isValid) {
    const issues = [];
    if (!startsWithEy) issues.push("doesn't start with 'ey'");
    if (!hasTwoPeriods) issues.push(`has ${periodCount} periods instead of 2`);
    if (!hasThreeParts) issues.push(`has ${parts.length} parts instead of 3`);
    if (apiKey.length <= 100) issues.push(`too short (${apiKey.length} chars)`);
    
    message += ': ' + issues.join(', ');
  }
  
  return {
    isValid,
    details: {
      length: apiKey.length,
      startsWithEy,
      hasTwoPeriods,
      hasThreeParts
    },
    message
  };
}
