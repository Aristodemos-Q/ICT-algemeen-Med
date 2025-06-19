/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

// Authenticatie service voor BV Floriande
import { supabase } from './supabaseClient';

export const authService = {
  supabase,
  
  /**
   * Wachtwoord reset email sturen
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  },

  /**
   * Registreer een nieuwe gebruiker (voor registratiepagina)
   */
  async signUp(email: string, password: string, metadata?: any) {
    // Valideer wachtwoord lengte
    if (password.length < 8) {
      throw new Error('Wachtwoord moet minimaal 8 tekens lang zijn');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      },
    });
    
    if (error) {
      throw error;
    }
    
    // Return the full data object, not just data.user
    return { data, error: null };
  },

  /**
   * Login met email en wachtwoord
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  },

  /**
   * Log de huidige gebruiker uit
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
  },

  /**
   * Haal de huidige geauthenticeerde gebruiker op
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    return user;
  },

  /**
   * Verstuur bevestigingsmail opnieuw (uitgeschakeld voor ontwikkeling)
   */
  async resendConfirmation(email: string) {
    // Functionaliteit uitgeschakeld voor ontwikkeling
    console.log('Email confirmation is disabled for development');
    return { success: true };
  },

  /**
   * Update wachtwoord functie (voor reset password)
   */
  async updatePassword(newPassword: string) {
    if (newPassword.length < 8) {
      throw new Error('Wachtwoord moet minimaal 8 tekens lang zijn');
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  },
};
