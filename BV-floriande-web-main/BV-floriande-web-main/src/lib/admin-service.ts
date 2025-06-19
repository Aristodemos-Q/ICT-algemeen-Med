/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

import { supabase } from './supabaseClient';

export interface ApprovedEmail {
  id: string;
  email: string;
  approved_by: string;
  role: 'admin' | 'trainer';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RegistrationRequest {
  id: string;
  email: string;
  name: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
}

export interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  last_sign_in_at?: string;
}

export const adminService = {
  // Approved Emails Management
  async getApprovedEmails(): Promise<ApprovedEmail[]> {
    const { data, error } = await supabase
      .from('approved_emails')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addApprovedEmail(email: string, role: 'admin' | 'trainer', notes?: string): Promise<ApprovedEmail> {
    const { data, error } = await supabase
      .from('approved_emails')
      .insert({
        email,
        role,
        notes,
        approved_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeApprovedEmail(id: string): Promise<void> {
    const { error } = await supabase
      .from('approved_emails')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateApprovedEmail(id: string, updates: Partial<Pick<ApprovedEmail, 'role' | 'notes'>>): Promise<ApprovedEmail> {
    const { data, error } = await supabase
      .from('approved_emails')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Registration Requests Management
  async getRegistrationRequests(): Promise<RegistrationRequest[]> {
    const { data, error } = await supabase
      .from('registration_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPendingRegistrationRequests(): Promise<RegistrationRequest[]> {
    const { data, error } = await supabase
      .from('registration_requests')
      .select('*')
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async reviewRegistrationRequest(
    requestId: string, 
    status: 'approved' | 'rejected', 
    notes?: string
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('review_registration_request', {
      request_id: requestId,
      approval_status: status,
      admin_notes: notes
    });

    if (error) throw error;
    return data;
  },

  // User Management
  async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId);

    if (error) throw error;
  },

  async getAllUsers(): Promise<any[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // User Role Management
  async getUsersWithRoles(): Promise<UserWithRole[]> {
    const { data, error } = await supabase.rpc('get_users_with_roles');

    if (error) throw error;
    return data || [];
  },

  async promoteUserToAdmin(userId: string): Promise<void> {
    const { error } = await supabase.rpc('promote_user_to_admin', {
      target_user_id: userId
    });

    if (error) throw error;
  },

  async demoteAdminToTrainer(userId: string): Promise<void> {
    const { error } = await supabase.rpc('demote_admin_to_trainer', {
      target_user_id: userId
    });

    if (error) throw error;
  },

  async hasAnyAdmin(): Promise<boolean> {
    const { data, error } = await supabase.rpc('has_any_admin');

    if (error) throw error;
    return data;
  },

  async setupInitialAdmin(userEmail: string): Promise<void> {
    const { error } = await supabase.rpc('setup_initial_admin', {
      user_email: userEmail
    });

    if (error) throw error;
  },

  // Email validation
  async isEmailApproved(email: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_email_approved', {
      check_email: email
    });

    if (error) throw error;
    return data;
  }
};

// Public function for registration requests (no auth required)
export const registrationService = {
  async submitRequest(email: string, name: string, message?: string): Promise<string> {
    const { data, error } = await supabase.rpc('submit_registration_request', {
      request_email: email,
      request_name: name,
      request_message: message
    });

    if (error) throw error;
    return data;
  },

  async checkEmailApproval(email: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_email_approved', {
      check_email: email
    });

    if (error) throw error;
    return data;
  }
};
