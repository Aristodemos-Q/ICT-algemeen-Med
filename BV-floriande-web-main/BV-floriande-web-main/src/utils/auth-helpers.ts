/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

import { authService } from '@/lib/authService';

export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await authService.supabase.auth.getSession();
    return !error;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
}
