/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

// Helper functies voor het werken met de BV Floriande database
import { supabase } from './supabaseClient';
import type { 
  User, 
  Group, 
  Member, 
  Location, 
  Session, 
  Exercise, 
  Attendance, 
  CompletedExercise, 
  GroupEvaluation 
} from './database-types';

/**
 * Utility voor het omgaan met databasefouten
 */
const handleError = (error: any, customMessage?: string) => {
  console.error(customMessage || 'Database error:', error);
  throw new Error(customMessage || error.message || 'Er is een onbekende databasefout opgetreden');
};

/**
 * Functies voor het werken met gebruikers
 */
export const userQueries = {
  /**
   * Haal de huidige ingelogde gebruiker op
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      handleError(error, 'Fout bij het ophalen van de huidige gebruiker');
      return null;
    }
    
    if (!user) return null;
    
    const { data, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      handleError(profileError, 'Fout bij het ophalen van het gebruikersprofiel');
      return null;
    }
    
    return data;
  },
  
  /**
   * Controleer of de huidige gebruiker een beheerder is
   */
  async isAdmin() {
    const user = await this.getCurrentUser();
    return user?.role === 'admin';
  },
  
  /**
   * Haal alle gebruikers op
   */
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      handleError(error, 'Fout bij het ophalen van gebruikers');
      return [];
    }
    
    return data || [];
  },
    /**
   * Haal alle trainers op
   */
  async getAllTrainers() {
    try {
      console.log('bvf-queries: Fetching all trainers...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'trainer');
      
      if (error) {
        console.error('Error in bvf-queries getAllTrainers:', {
          message: error.message || 'No error message',
          details: error.details || 'No error details', 
          hint: error.hint || 'No error hint',
          code: error.code || 'No error code',
          error: error
        });

        // Check for RLS infinite recursion
        if (error.message?.includes('infinite recursion')) {
          console.error('🔥 CRITICAL: RLS infinite recursion detected in bvf-queries!');
          console.error('📋 SOLUTION: Apply the RLS fix from RLS-FIX-MANUAL-INSTRUCTIONS.md');
          console.error('⚠️  Returning empty trainers array to prevent app crash');
          return [];
        }

        handleError(error, 'Fout bij het ophalen van trainers');
        return [];
      }
      
      console.log(`bvf-queries: Successfully fetched ${data?.length || 0} trainers`);
      return data || [];
      
    } catch (error) {
      console.error('Exception in bvf-queries getAllTrainers:', error);
      
      if (error instanceof Error && error.message?.includes('infinite recursion')) {
        console.error('🔥 CRITICAL: RLS infinite recursion exception in bvf-queries!');
        return [];
      }
      
      return [];
    }
  }
};

/**
 * Functies voor het werken met groepen
 */
export const groupQueries = {  /**
   * Haal alle groepen op
   */
  async getAllGroups() {
    try {
      console.log('bvf-queries getAllGroups: Fetching all groups...');
      
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error in bvf-queries getAllGroups:', {
          message: error.message || 'No error message',
          details: error.details || 'No error details', 
          hint: error.hint || 'No error hint',
          code: error.code || 'No error code',
          error: error
        });
        
        // Check for RLS infinite recursion - comprehensive detection
        if (error.message?.includes('infinite recursion') || error.code === '42P17') {
          console.error('🔥 CRITICAL: RLS infinite recursion detected in bvf-queries getAllGroups!');
          console.error('📋 SOLUTION: Apply the RLS fix from RLS-FIX-MANUAL-INSTRUCTIONS.md');
          console.error('🔗 Go to: https://supabase.com/dashboard/project/cumsctqzjowisphyhnfj → SQL Editor');
          console.error('⚠️  Returning empty groups array to prevent app crash');
          return [];
        }

        // For other errors, log but don't crash the app
        console.error('❌ Non-recursion database error occurred in bvf-queries getAllGroups');
        handleError(error, 'Fout bij het ophalen van groepen');
        return [];
      }
      
      console.log(`✅ Successfully fetched ${data?.length || 0} groups in bvf-queries`);
      return data || [];
      
    } catch (error) {
      console.error('Exception in bvf-queries getAllGroups:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        errorType: typeof error
      });

      // Additional debugging for infinite recursion in exceptions
      if (error instanceof Error && error.message?.includes('infinite recursion')) {
        console.error('🔥 CRITICAL: RLS infinite recursion exception detected in bvf-queries getAllGroups!');
        console.error('📋 NEXT STEPS:');
        console.error('  1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/cumsctqzjowisphyhnfj');
        console.error('  2. Open SQL Editor');
        console.error('  3. Apply the fix from RLS-FIX-MANUAL-INSTRUCTIONS.md');
        console.error('⚠️  Returning empty groups array to prevent app crash');
        return [];
      }

      // For other exceptions, return empty array to prevent crash
      console.error('❌ Exception occurred in bvf-queries getAllGroups, returning empty groups array');
      return [];
    }
  },

  /**
   * Maak een nieuwe groep aan
   */
  async createGroup(group: {
    name: string;
    description?: string;
    level?: string;
    age_category?: string;
    max_members?: number;
    created_by: string;
  }) {
    try {
      console.log('bvf-queries createGroup: Creating new group:', { name: group.name, created_by: group.created_by });
      
      const { data, error } = await supabase
        .from('groups')
        .insert([group])
        .select()
        .single();
      
      if (error) {
        console.error('Error in bvf-queries createGroup:', {
          message: error.message || 'No error message',
          details: error.details || 'No error details', 
          hint: error.hint || 'No error hint',
          code: error.code || 'No error code',
          groupData: group,
          error: error
        });
        
        // Check for RLS infinite recursion - comprehensive detection
        if (error.message?.includes('infinite recursion') || error.code === '42P17') {
          console.error('🔥 CRITICAL: RLS infinite recursion detected in bvf-queries createGroup!');
          console.error('📋 SOLUTION: Apply the RLS fix from RLS-FIX-MANUAL-INSTRUCTIONS.md');
          console.error('🔗 Go to: https://supabase.com/dashboard/project/cumsctqzjowisphyhnfj → SQL Editor');
          console.error('⚠️  Cannot create group due to RLS recursion issue');
          throw new Error('Database configuration error. Please contact system administrator.');
        }

        // For other errors, provide detailed information but don't crash completely
        console.error('❌ Non-recursion database error occurred in bvf-queries createGroup');
        handleError(error, 'Fout bij het aanmaken van de groep');
        throw error;
      }
      
      console.log(`✅ Successfully created group in bvf-queries: ${data.name} (ID: ${data.id})`);
      return data;
      
    } catch (error) {
      console.error('Exception in bvf-queries createGroup:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        errorType: typeof error,
        groupData: group
      });

      // Additional debugging for infinite recursion in exceptions
      if (error instanceof Error && error.message?.includes('infinite recursion')) {
        console.error('🔥 CRITICAL: RLS infinite recursion exception detected in bvf-queries createGroup!');
        console.error('📋 NEXT STEPS:');
        console.error('  1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/cumsctqzjowisphyhnfj');
        console.error('  2. Open SQL Editor');
        console.error('  3. Apply the fix from RLS-FIX-MANUAL-INSTRUCTIONS.md');
        throw new Error('Database configuration error. Please contact system administrator.');
      }

      // Re-throw the error for proper error handling in UI
      throw error;
    }
  },
  
  /**
   * Haal een specifieke groep op met leden
   */
  async getGroupWithMembers(groupId: string) {
    // Haal eerst de groep op
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();
    
    if (groupError) {
      handleError(groupError, 'Fout bij het ophalen van de groep');
      return null;
    }
    
    // Haal dan de groepsleden op
    const { data: groupMembersJoin, error: membersError } = await supabase
      .from('group_members')
      .select(`
        member_id,
        members (*)
      `)
      .eq('group_id', groupId);
    
    if (membersError) {
      handleError(membersError, 'Fout bij het ophalen van groepsleden');
      return null;
    }
    
    // Haal evaluaties op
    const { data: evaluations, error: evalError } = await supabase
      .from('group_evaluations')
      .select('*')
      .eq('group_id', groupId)
      .order('evaluation_date', { ascending: false })
      .limit(1);
    
    if (evalError) {
      handleError(evalError, 'Fout bij het ophalen van groepsevaluaties');
      return null;
    }
    
    // Combineer alles in één object
    return {
      ...group,
      members: groupMembersJoin?.map(item => item.members) || [],
      latestEvaluation: evaluations?.length ? evaluations[0] : null
    };
  },
  
  /**
   * Haal een specifieke groep op met leden en trainers
   */
  async getGroupWithMembersAndTrainers(groupId: string) {
    // Haal eerst de groep op
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();
    
    if (groupError) {
      handleError(groupError, 'Fout bij het ophalen van de groep');
      return null;
    }
    
    // Haal de groepsleden op
    const { data: groupMembersJoin, error: membersError } = await supabase
      .from('group_members')
      .select(`
        member_id,
        members (*)
      `)
      .eq('group_id', groupId);
    
    if (membersError) {
      handleError(membersError, 'Fout bij het ophalen van groepsleden');
      return null;
    }
    
    // Haal de toegewezen trainers op
    const { data: groupTrainersJoin, error: trainersError } = await supabase
      .from('group_trainers')
      .select(`
        *,
        trainer:users!trainer_id(*),
        assigned_by_user:users!assigned_by(*)
      `)
      .eq('group_id', groupId);
    
    if (trainersError) {
      handleError(trainersError, 'Fout bij het ophalen van groepstrainers');
      return null;
    }
    
    // Haal evaluaties op
    const { data: evaluations, error: evalError } = await supabase
      .from('group_evaluations')
      .select('*')
      .eq('group_id', groupId)
      .order('evaluation_date', { ascending: false })
      .limit(1);
    
    if (evalError) {
      handleError(evalError, 'Fout bij het ophalen van groepsevaluaties');
      return null;
    }
    
    // Combineer alles in één object
    return {
      ...group,
      members: groupMembersJoin?.map(item => item.members) || [],
      trainers: groupTrainersJoin || [],
      latestEvaluation: evaluations?.length ? evaluations[0] : null
    };
  }
};

/**
 * Functies voor het werken met oefeningen
 */
export const exerciseQueries = {
  /**
   * Haal alle oefeningen op
   */
  async getAllExercises() {
    const { data, error } = await supabase
      .from('exercises')
      .select('*');
    
    if (error) {
      handleError(error, 'Fout bij het ophalen van oefeningen');
      return [];
    }
    
    return data || [];
  },
  
  /**
   * Haal uitgevoerde oefeningen op voor een groep tijdens een bepaalde sessie
   */
  async getCompletedExercisesForSession(sessionId: string, groupId: string) {
    const { data, error } = await supabase
      .from('completed_exercises')
      .select(`
        *,
        exercises (*)
      `)
      .eq('session_id', sessionId)
      .eq('group_id', groupId);
    
    if (error) {
      handleError(error, 'Fout bij het ophalen van uitgevoerde oefeningen');
      return [];
    }
    
    return data || [];
  },
  
  /**
   * Haal nog niet uitgevoerde oefeningen op voor een groep
   */
  async getPendingExercisesForGroup(groupId: string) {
    const { data, error } = await supabase
      .from('group_pending_exercises')
      .select('*')
      .eq('group_id', groupId);
    
    if (error) {
      handleError(error, 'Fout bij het ophalen van niet-uitgevoerde oefeningen');
      return [];
    }
    
    return data || [];
  },
  
  /**
   * Haal moeilijkheidsoverzicht op voor een groep
   */
  async getDifficultySummaryForGroup(groupId: string) {
    const { data, error } = await supabase
      .from('group_difficulty_summary')
      .select('*')
      .eq('group_id', groupId);
    
    if (error) {
      handleError(error, 'Fout bij het ophalen van moeilijkheidsoverzicht');
      return [];
    }
    
    return data || [];
  }
};

/**
 * Functies voor het werken met sessies en aanwezigheid
 */
export const sessionQueries = {
  /**
   * Haal sessies op voor een groep
   */
  async getSessionsForGroup(groupId: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        session_trainers (
          users (
            id,
            name
          )
        ),
        locations (
          name,
          address
        )
      `)
      .eq('group_id', groupId)
      .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Sessies van de afgelopen 30 dagen
      .order('start_time', { ascending: true });
    
    if (error) {
      handleError(error, 'Fout bij het ophalen van sessies');
      return [];
    }
    
    return data || [];
  },
  
  /**
   * Haal sessies op voor een trainer
   */
  async getSessionsForTrainer(trainerId: string) {
    const { data, error } = await supabase
      .from('session_trainers')
      .select(`
        sessions (
          *,
          groups (
            id,
            name
          ),
          locations (
            name,
            address
          )
        )
      `)
      .eq('user_id', trainerId);
    
    if (error) {
      handleError(error, 'Fout bij het ophalen van trainersessies');
      return [];
    }
    
    return data?.map(item => item.sessions) || [];
  },
  
  /**
   * Haal aanwezigheidsgegevens op voor een sessie
   */
  async getAttendanceForSession(sessionId: string) {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        members (
          id,
          name
        ),
        users (
          name
        )
      `)
      .eq('session_id', sessionId);
    
    if (error) {
      handleError(error, 'Fout bij het ophalen van aanwezigheidsgegevens');
      return [];
    }
    
    return data || [];
  }
};

/**
 * Gegevens voor het dashboard
 */
export const dashboardQueries = {
  /**
   * Haal gegevens op voor het trainer-dashboard
   */
  async getTrainerDashboardData(trainerId: string) {
    try {
      console.log('Getting dashboard data for trainer:', trainerId);
      
      const [upcomingSessions, groupsData] = await Promise.all([
        // Ophalen van aankomende sessies
        supabase
          .from('session_trainers')
          .select(`
            sessions!inner (
              *,
              groups (
                id,
                name
              ),
              locations (
                name,
                address
              )
            )
          `)
          .eq('user_id', trainerId)
          .gte('sessions.start_time', new Date().toISOString())
          .order('sessions.start_time', { ascending: true })
          .limit(5),
        
        // Ophalen van groepsgegevens
        supabase
          .from('groups')
          .select('*')
          .eq('created_by', trainerId)
      ]);

      console.log('Upcoming sessions query result:', upcomingSessions);
      console.log('Groups query result:', groupsData);
      
      return {
        upcomingSessions: upcomingSessions.data?.map(item => item.sessions).filter(Boolean) || [],
        groups: groupsData.data || []
      };
    } catch (error) {
      console.error('Dashboard query error:', error);
      handleError(error, 'Fout bij het ophalen van dashboard gegevens');
      return {
        upcomingSessions: [],
        groups: []
      };
    }
  }
};

// Alle queries exporteren als één object
export const bvfQueries = {
  users: userQueries,
  groups: groupQueries,
  exercises: exerciseQueries,
  sessions: sessionQueries,
  dashboard: dashboardQueries
};
