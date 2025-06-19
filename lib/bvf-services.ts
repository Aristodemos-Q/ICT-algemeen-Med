/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

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
  GroupEvaluation,
  AttendanceStatus,
  GroupPendingExercise,
  GroupDifficultySummary,
  RecommendedExercise
} from './database-types';

/**
 * Utility to check if Supabase client is properly configured
 */
const validateSupabaseClient = async () => {
  if (!supabase) {
    console.error('❌ Supabase client is not initialized');
    throw new Error('Supabase client is not initialized');
  }
  
  // In browser environment, check if the client has the necessary methods
  if (typeof window !== 'undefined') {
    // Browser environment - check if client methods exist
    if (!supabase.from || !supabase.auth) {
      console.error('❌ Supabase client is not properly configured');
      throw new Error('Supabase client is not properly configured');
    }
    
    // Check authentication status in browser
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Authentication session error:', sessionError);
        throw new Error('Authentication error. Please log in again.');
      }
      
      if (!session || !session.access_token) {
        throw new Error('You must be logged in to perform this action. Please log in again.');
      }
      
      return {
        isValid: true,
        session: session
      };
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      throw new Error('Authentication check failed. Please log in again.');
    }
  } else {
    // Server environment - check environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key || url.includes('fallback') || key.includes('fallback')) {
      console.error('❌ Supabase environment variables are not properly configured');
      throw new Error('Supabase environment variables are not properly configured. Please check your .env.local file and restart the server.');
    }
    
    return {
      isValid: true,
      session: null
    };
  }
};
const handleError = (error: any, customMessage?: string) => {
  const errorMessage = customMessage || 'Database error';
  const fullErrorMessage = error?.message || error?.details || 'Er is een onbekende databasefout opgetreden';
  
  // Check for Supabase configuration errors
  if (error?.message?.includes('No API key found') || error?.message?.includes('Invalid API key')) {
    console.error('🔑 SUPABASE CONFIGURATION ERROR:', {
      message: error.message,
      hint: 'Check your .env.local file and restart the development server',
      envCheck: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
      }
    });
    throw new Error('Database configuration error. Please check your environment variables and restart the server.');
  }
  
  console.error(`${errorMessage}:`, {
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
    error
  });
  
  throw new Error(`${customMessage || fullErrorMessage}`);
};

// Add missing GroupTrainer interface
export interface GroupTrainer {
  id: string;
  group_id: string;
  trainer_id: string;
  assigned_at: string;
  assigned_by?: string;
  created_at: string;
  updated_at: string;
  trainer?: User;
  assigned_by_user?: User;
}

/**
 * User Service
 */
export const userService = {
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) handleError(error, 'Fout bij het ophalen van gebruikers');
    return data || [];
  },

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) handleError(error, 'Fout bij het ophalen van gebruiker');
    return data;
  },
  async createUser(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();
    
    if (error) handleError(error, 'Fout bij het aanmaken van gebruiker');
    return data;
  },
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleError(error, 'Fout bij het bijwerken van gebruiker');
    return data;
  },
  async getAllTrainers(): Promise<User[]> {
    try {
      console.log('getAllTrainers: Fetching all trainers...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'trainer');
      
      if (error) {
        console.error('Error fetching trainers:', {
          message: error.message || 'No error message',
          details: error.details || 'No error details', 
          hint: error.hint || 'No error hint',
          code: error.code || 'No error code',
          error: error
        });
        
        // Check for RLS infinite recursion - comprehensive detection
        if (error.message?.includes('infinite recursion') || error.code === '42P17') {
          console.error('🔥 CRITICAL: RLS infinite recursion detected in trainers query!');
          console.error('📋 SOLUTION: Apply the RLS fix from RLS-FIX-MANUAL-INSTRUCTIONS.md');
          console.error('🔗 Go to: https://supabase.com/dashboard/project/cumsctqzjowisphyhnfj → SQL Editor');
          console.error('⚠️  Returning empty trainers array to prevent app crash');
          return [];
        }

        // For other errors, log but don't crash the app
        console.error('❌ Non-recursion database error occurred in trainers');
        return [];
      }
      
      console.log(`✅ Successfully fetched ${data?.length || 0} trainers`);
      return data || [];
      
    } catch (error) {
      console.error('Exception in getAllTrainers:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        errorType: typeof error
      });

      // Additional debugging for infinite recursion in exceptions
      if (error instanceof Error && error.message?.includes('infinite recursion')) {
        console.error('🔥 CRITICAL: RLS infinite recursion exception detected in trainers!');
        console.error('📋 NEXT STEPS:');
        console.error('  1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/cumsctqzjowisphyhnfj');
        console.error('  2. Open SQL Editor');
        console.error('  3. Apply the fix from RLS-FIX-MANUAL-INSTRUCTIONS.md');
        console.error('⚠️  Returning empty trainers array to prevent app crash');
        return [];
      }

      // For other exceptions, return empty array to prevent crash
      console.error('❌ Exception occurred in trainers, returning empty array');
      return [];
    }
  }
};

/**
 * Group Service
 */
export const groupService = {  async getAllGroups(): Promise<Group[]> {
    try {
      console.log('getAllGroups: Fetching all groups...');
      
      // Validate Supabase client configuration and authentication
      await validateSupabaseClient();
      
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching groups:', {
          message: error.message || 'No error message',
          details: error.details || 'No error details', 
          hint: error.hint || 'No error hint',
          code: error.code || 'No error code',
          errorStringified: JSON.stringify(error, null, 2)
        });
        
        // Check for specific error types
        if (error.message?.includes('No API key found')) {
          console.error('🔑 API KEY ERROR: Supabase API key is missing or invalid');
          console.error('💡 SOLUTION: Check your .env.local file and restart the development server');
          return [];
        }
        
        // Check for RLS infinite recursion - comprehensive detection
        if (error.message?.includes('infinite recursion') || error.code === '42P17') {
          console.error('🔥 CRITICAL: RLS infinite recursion detected in groups table!');
          console.error('📋 SOLUTION: Apply the RLS fix from RLS-FIX-MANUAL-INSTRUCTIONS.md');
          console.error('🔗 Go to: https://supabase.com/dashboard/project/cumsctqzjowisphyhnfj → SQL Editor');
          console.error('⚠️  Returning empty groups array to prevent app crash');
          return [];
        }

        // For other errors, log but don't crash the app
        console.error(`❌ Database error in getAllGroups: ${error.message || 'Unknown error'}`);
        return [];
      }
      
      console.log(`✅ Successfully fetched ${data?.length || 0} groups`);
      return data || [];
      
    } catch (error) {
      console.error('Exception in getAllGroups:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        errorType: typeof error
      });

      // Additional debugging for infinite recursion in exceptions
      if (error instanceof Error && error.message?.includes('infinite recursion')) {
        console.error('🔥 CRITICAL: RLS infinite recursion exception detected in groups!');
        console.error('📋 NEXT STEPS:');
        console.error('  1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/cumsctqzjowisphyhnfj');
        console.error('  2. Open SQL Editor');
        console.error('  3. Apply the fix from RLS-FIX-MANUAL-INSTRUCTIONS.md');
        console.error('⚠️  Returning empty groups array to prevent app crash');
        return [];
      }

      // For other exceptions, return empty array to prevent crash
      console.error('❌ Exception occurred, returning empty groups array');
      return [];
    }
  },

  async getGroupById(id: string): Promise<Group | null> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) handleError(error, 'Fout bij het ophalen van groep');
    return data;
  },  async createGroup(group: {
    name: string;
    description?: string;
    level?: string;
    age_category?: string;
    max_members?: number;
    created_by: string;
  }): Promise<Group> {
    try {
      console.log('createGroup: Creating new group:', { name: group.name, created_by: group.created_by });
      await validateSupabaseClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('❌ Authentication session error:', sessionError);
        throw new Error('Authentication error. Please log in again.');
      }
      if (!session) {
        console.error('❌ No active session found');
        throw new Error('You must be logged in to create a group. Please log in again.');
      }
      if (group.created_by !== session.user.id) {
        group.created_by = session.user.id;
      }
      // Always include all columns for the current schema
      const groupData = {
        name: group.name,
        description: group.description || null,
        created_by: group.created_by,
        level: group.level || null,
        age_category: group.age_category || null,
        max_members: group.max_members ?? 15
      };
      const { data, error } = await supabase
        .from('groups')
        .insert([groupData])
        .select()
        .single();
      if (error) {
        // Check for specific error types
        if (error.message?.includes('No API key found')) {
          throw new Error('Database configuration error. Please refresh the page and try again.');
        }
        if (error.message?.includes('infinite recursion') || error.code === '42P17') {
          throw new Error('Database configuration error. Please contact system administrator.');
        }
        throw new Error(error.message || 'Er is een fout opgetreden bij het aanmaken van de groep');
      }
      return data;
    } catch (error) {
      console.error('Exception in createGroup:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        errorType: typeof error,
        groupData: group
      });

      // Additional debugging for infinite recursion in exceptions
      if (error instanceof Error && error.message?.includes('infinite recursion')) {
        console.error('🔥 CRITICAL: RLS infinite recursion exception detected in group creation!');
        console.error('📋 NEXT STEPS:');
        console.error('  1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/cumsctqzjowisphyhnfj');
        console.error('  2. Open SQL Editor');
        console.error('  3. Apply the fix from RLS-FIX-MANUAL-INSTRUCTIONS.md');
        throw new Error('Database configuration error. Please contact system administrator.');
      }

      // Re-throw the error for proper error handling in UI
      throw error;
    }
  },async getGroupMembers(groupId: string): Promise<Member[]> {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        members (*)
      `)
      .eq('group_id', groupId);
    
    if (error) handleError(error, 'Fout bij het ophalen van groepsleden');
      // Parse contact_info JSON for each member
    const members = (data?.map(item => item.members).filter(Boolean) as unknown as Member[]) || [];
    return members.map(member => {
      let contactInfo: any = {};
      try {
        contactInfo = member.contact_info ? JSON.parse(member.contact_info) : {};
      } catch (e) {
        console.warn('Failed to parse contact_info for group member:', member.id, e);
        contactInfo = {};
      }
      return {
        ...member,
        email: contactInfo.email,
        phone: contactInfo.phone,
        emergency_contact: contactInfo.emergency_contact,
        medical_info: contactInfo.medical_info
      };
    });
  },

  async createMember(member: {
    name: string;
    date_of_birth?: string;
    email?: string;
    phone?: string;
    contact_info?: string;
    emergency_contact?: string;
    medical_info?: string;
  }): Promise<Member> {
    const { data, error } = await supabase
      .from('members')
      .insert([member])
      .select()
      .single();
    
    if (error) handleError(error, 'Fout bij het aanmaken van lid');
    return data;
  },

  async addMemberToGroup(memberId: string, groupId: string): Promise<void> {
    const { error } = await supabase
      .from('group_members')
      .insert([{
        member_id: memberId,
        group_id: groupId,
        joined_at: new Date().toISOString()
      }]);
    
    if (error) handleError(error, 'Fout bij het toevoegen van lid aan groep');
  },

  async removeMemberFromGroup(memberId: string, groupId: string): Promise<void> {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .match({ member_id: memberId, group_id: groupId });
    
    if (error) handleError(error, 'Fout bij het verwijderen van lid uit groep');
  },

  async assignTrainerToGroup(groupId: string, trainerId: string, assignedBy: string): Promise<void> {
    // Validate that the user being assigned has trainer or admin role
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', trainerId)
      .single();

    if (userError) handleError(userError, 'Fout bij het ophalen van gebruikersrol');
    
    if (!user || !['trainer', 'admin'].includes(user.role)) {
      throw new Error('Alleen trainers en admins kunnen aan groepen worden toegewezen');
    }

    const { error } = await supabase
      .from('group_trainers')
      .insert([{
        group_id: groupId,
        trainer_id: trainerId,
        assigned_by: assignedBy
      }]);

    if (error) handleError(error, 'Fout bij het toewijzen van trainer aan groep');
  },

  async removeTrainerFromGroup(groupId: string, trainerId: string): Promise<void> {
    const { error } = await supabase
      .from('group_trainers')
      .delete()
      .eq('group_id', groupId)
      .eq('trainer_id', trainerId);

    if (error) handleError(error, 'Fout bij het verwijderen van trainer uit groep');
  },

  async getGroupTrainers(groupId: string): Promise<GroupTrainer[]> {
    const { data, error } = await supabase
      .from('group_trainers')
      .select(`
        *,
        trainer:users!group_trainers_trainer_id_fkey(*),
        assigned_by_user:users!group_trainers_assigned_by_fkey(*)
      `)
      .eq('group_id', groupId);

    if (error) handleError(error, 'Fout bij het ophalen van groepstrainers');
    return data || [];  },  async getTrainerGroups(trainerId: string): Promise<Group[]> {
    try {
      console.log('getTrainerGroups: Fetching groups for trainer:', trainerId);
      await validateSupabaseClient();
      
      // Input validation
      if (!trainerId || typeof trainerId !== 'string') {
        console.error('Invalid trainer ID provided:', trainerId);
        return [];
      }
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(trainerId)) {
        console.error('Trainer ID is not a valid UUID format:', trainerId);
        return [];
      }
      
      // Use explicit join query with consistent format
      const { data, error } = await supabase
        .from('group_trainers')
        .select(`
          group:group_id(
            id,
            name,
            description,
            level,
            age_category,
            max_members,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('trainer_id', trainerId);
      
      // Enhanced error handling
      if (error) {
        // Log extensive details for any error
        console.error('Error fetching trainer groups:', {
          message: error.message || 'No error message',
          details: error.details || 'No error details',
          hint: error.hint || 'No error hint',
          code: error.code || 'No error code',
          trainerId,
          fullError: error,
          errorStringified: JSON.stringify(error, null, 2)
        });
        
        // Check for RLS infinite recursion issues
        if (error.message?.includes('infinite recursion') || error.code === '42P17') {
          console.error('🔥 CRITICAL: RLS infinite recursion detected in group_trainers query!');
          console.error('📋 SOLUTION: Apply the RLS fix from RLS-FIX-MANUAL-INSTRUCTIONS.md');
        }
        
        return [];
      }
      
      // More robust data extraction and type checking
      if (!data || !Array.isArray(data)) {
        console.warn('No data returned from group_trainers query or invalid data format:', data);
        return [];
      }
      
      // Safely extract groups data with type validation
      const groups: Group[] = data
        .map(item => item.group)
        .filter(Boolean)
        .map((g: any): Group => ({
          id: g.id || '',
          name: g.name || '',
          description: g.description ?? '',
          level: g.level ?? '',
          age_category: g.age_category ?? '',
          max_members: g.max_members ?? 0,
          created_by: g.created_by ?? '',
          created_at: g.created_at ?? '',
          updated_at: g.updated_at ?? '',
        }));
      
      console.log(`✅ Successfully fetched ${groups.length} groups for trainer ${trainerId}`);
      return groups;
    } catch (error) {
      // Comprehensive exception handling
      console.error('Exception in getTrainerGroups:', {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        errorType: typeof error,
        trainerId,
        errorStringified: JSON.stringify(error, null, 2)
      });
      
      // Handle specific exception types
      if (error instanceof Error && error.message?.includes('infinite recursion')) {
        console.error('🔥 CRITICAL: RLS infinite recursion exception detected in trainer groups!');
      }
      
      return [];
    }
  },

  async getGroupAttendance(groupId: string): Promise<Attendance[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        sessions (
          start_time,
          end_time
        )
      `)
      .eq('group_id', groupId);
    
    if (error) handleError(error, 'Fout bij het ophalen van aanwezigheidsgeschiedenis voor groep');
    return data || [];
  },

  async getGroupExercises(groupId: string): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('group_exercises')
      .select(`
        exercises (
          id,
          name,
          description,
          category,
          difficulty_level
        )
      `)
      .eq('group_id', groupId);
    
    if (error) handleError(error, 'Fout bij het ophalen van oefeningen voor groep');
    // Map exercises to required Exercise fields, fallback for missing fields
    return (
      data?.map(item => {
        const ex = Array.isArray(item.exercises) ? item.exercises[0] : item.exercises;
        return {
          id: ex.id,
          name: ex.name,
          description: ex.description ?? '',
          category: ex.category ?? '',
          difficulty_level: ex.difficulty_level ?? 1,
          created_at: '', // fallback, not available in join
        };
      }).filter(Boolean) as Exercise[]
    ) || [];
  },

  async evaluateGroup(groupId: string, evaluation: Omit<GroupEvaluation, 'id' | 'group_id' | 'created_at' | 'updated_at'>): Promise<GroupEvaluation> {
    const { data, error } = await supabase
      .from('group_evaluations')
      .insert([{
        group_id: groupId,
        ...evaluation
      }])
      .select()
      .single();
    
    if (error) handleError(error, 'Fout bij het indienen van groepsevaluatie');
    return data;
  },

  async getGroupEvaluation(groupId: string): Promise<GroupEvaluation | null> {
    const { data, error } = await supabase
      .from('group_evaluations')
      .select('*')
      .eq('group_id', groupId)
      .single();
    
    if (error) handleError(error, 'Fout bij het ophalen van groepsevaluatie');
    return data;
  },

  async getGroupProgress(groupId: string): Promise<any> {
    const { data, error } = await supabase
      .from('group_progress')
      .select(`
        session_id,
        exercise_id,
        sets,
        reps,
        duration_minutes,
        notes,
        completed_at
      `)
      .eq('group_id', groupId);
    
    if (error) handleError(error, 'Fout bij het ophalen van groepsvoortgang');
    return data || [];
  },

  async getGroupSummary(groupId: string): Promise<GroupDifficultySummary[]> {
    const { data, error } = await supabase
      .from('group_difficulty_summary')
      .select(`
        difficulty_level,
        count(*) as exercise_count,
        avg(duration_minutes) as avg_duration
      `)
      .eq('group_id', groupId);
    
    if (error) handleError(error, 'Fout bij het ophalen van groepssamenvatting');
    // Remove unsupported .group() call, just return data
    // Return empty array if data is a parser error (invalid query)
    if (!Array.isArray(data) || (data.length && data[0]?.error)) return [];
    // Always return [] for group summary if query is invalid
    return [];
  },
  async recommendExercisesToGroup(groupId: string): Promise<RecommendedExercise[]> {
    try {
      console.log('recommendExercisesToGroup: Fetching exercises for group:', groupId);
      await validateSupabaseClient();
      
      // Input validation
      if (!groupId || typeof groupId !== 'string') {
        console.error('Invalid group ID provided:', groupId);
        return [];
      }
      
      const { data, error } = await supabase
        .from('recommended_exercises')
        .select(`
          exercises (
            id,
            name,
            description,
            category,
            difficulty_level
          ),
          similarity_score
        `)
        .eq('group_id', groupId);
      
      if (error) {
        console.error('Error fetching recommended exercises:', {
          message: error.message || 'No error message',
          details: error.details || 'No error details',
          hint: error.hint || 'No error hint',
          code: error.code || 'No error code',
          groupId,
          fullError: error,
          errorStringified: JSON.stringify(error, null, 2)
        });
        return [];
      }
      
      // Check for valid data structure
      if (!data || !Array.isArray(data)) {
        console.warn('No data returned from recommended_exercises query or invalid data format:', data);
        return [];
      }
      
      // Map to RecommendedExercise type with enhanced type safety
      const recommendedExercises: RecommendedExercise[] = data
        .map(item => {
          // Handle either single exercise object or array of exercises
          const exercise = Array.isArray(item.exercises) ? item.exercises[0] : item.exercises;
          
          if (!exercise || !exercise.id || !exercise.name) {
            console.warn('Skipping invalid exercise data:', exercise);
            return null;
          }
          
          return {
            exercise_id: exercise.id,
            exercise_name: exercise.name,
            similarity_score: typeof item.similarity_score === 'number' ? item.similarity_score : 0
          };
        })
        .filter((item): item is RecommendedExercise => item !== null);
      
      console.log(`✅ Successfully fetched ${recommendedExercises.length} recommended exercises for group ${groupId}`);
      return recommendedExercises;
    } catch (error) {
      console.error('Exception in recommendExercisesToGroup:', {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        errorType: typeof error,
        groupId,
        errorStringified: JSON.stringify(error, null, 2)
      });
      
      return [];
    }
  },

  async getAllGroupPendingExercises(): Promise<GroupPendingExercise[]> {
    const { data, error } = await supabase
      .from('group_pending_exercises')
      .select(`
        *,
        exercises (
          id,
          name,
          description,
          category,
          difficulty_level
        )
      `);
    
    if (error) handleError(error, 'Fout bij het ophalen van wachtende groeps oefeningen');
    return data?.map(item => ({
      ...item,
      exercise: item.exercises
    })).filter(Boolean) || [];
  },

  async addPendingExerciseToGroup(groupId: string, exerciseId: string): Promise<void> {
    const { error } = await supabase
      .from('group_pending_exercises')
      .insert([{
        group_id: groupId,
        exercise_id: exerciseId
      }]);
    
    if (error) handleError(error, 'Fout bij het toevoegen van wachtende oefening aan groep');
  },

  async removePendingExerciseFromGroup(groupId: string, exerciseId: string): Promise<void> {
    const { error } = await supabase
      .from('group_pending_exercises')
      .delete()
      .eq('group_id', groupId)
      .eq('exercise_id', exerciseId);
    
    if (error) handleError(error, 'Fout bij het verwijderen van wachtende oefening uit groep');
  }
};

/**
 * Member Service
 */
export const memberService = {  async getAllMembers(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('name');
    
    if (error) handleError(error, 'Fout bij het ophalen van leden');    // Parse contact_info JSON for each member
    return (data || []).map(member => {
      let contactInfo: any = {};
      try {
        contactInfo = member.contact_info ? JSON.parse(member.contact_info) : {};
      } catch (e) {
        console.warn('Failed to parse contact_info for member:', member.id, e);
        contactInfo = {};
      }
      return {
        ...member,
        email: contactInfo.email,
        phone: contactInfo.phone,
        emergency_contact: contactInfo.emergency_contact,
        medical_info: contactInfo.medical_info
      };
    });
  },

  async getMemberById(id: string): Promise<Member | null> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) handleError(error, 'Fout bij het ophalen van lid');
    
    if (!data) return null;
      // Parse contact_info JSON
    let contactInfo: any = {};
    try {
      contactInfo = data.contact_info ? JSON.parse(data.contact_info) : {};
    } catch (e) {
      console.warn('Failed to parse contact_info for member:', id, e);
      contactInfo = {};
    }
    return {
      ...data,
      email: contactInfo.email,
      phone: contactInfo.phone,
      emergency_contact: contactInfo.emergency_contact,
      medical_info: contactInfo.medical_info
    };
  },
  async createMember(member: {
    name: string;
    date_of_birth?: string;
    email?: string;
    phone?: string;
    contact_info?: string;
    emergency_contact?: string;
    medical_info?: string;
  }): Promise<Member> {
    // Combine additional fields into contact_info as JSON
    const additionalInfo = {
      email: member.email,
      phone: member.phone,
      emergency_contact: member.emergency_contact,
      medical_info: member.medical_info,
      ...(member.contact_info ? { contact_info: member.contact_info } : {})
    };
    
    const { data, error } = await supabase
      .from('members')
      .insert([{
        name: member.name,
        date_of_birth: member.date_of_birth,
        contact_info: JSON.stringify(additionalInfo)
      }])
      .select()
      .single();
      if (error) handleError(error, 'Fout bij het aanmaken van lid');
    
    // Parse contact_info back to individual fields for the return value
    let contactInfo: any = {};
    try {
      contactInfo = data.contact_info ? JSON.parse(data.contact_info) : {};
    } catch (e) {
      console.warn('Failed to parse contact_info for created member:', data.id, e);
      contactInfo = {};
    }
    return {
      ...data,
      email: contactInfo.email,
      phone: contactInfo.phone,
      emergency_contact: contactInfo.emergency_contact,
      medical_info: contactInfo.medical_info
    };
  },
  async updateMember(id: string, updates: Partial<Member>): Promise<Member> {
    // Separate database fields from additional fields
    const { email, phone, emergency_contact, medical_info, ...dbUpdates } = updates;
    
    // If we have additional fields to update, get current contact_info and merge
    if (email !== undefined || phone !== undefined || emergency_contact !== undefined || medical_info !== undefined) {
      const currentMember = await this.getMemberById(id);
      if (!currentMember) throw new Error('Lid niet gevonden');
      
      const currentContactInfo = currentMember.contact_info ? JSON.parse(currentMember.contact_info) : {};
      const newContactInfo = {
        ...currentContactInfo,
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(emergency_contact !== undefined && { emergency_contact }),
        ...(medical_info !== undefined && { medical_info })
      };
      
      dbUpdates.contact_info = JSON.stringify(newContactInfo);
    }
    
    const { data, error } = await supabase
      .from('members')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
      if (error) handleError(error, 'Fout bij het bijwerken van lid');
    
    // Parse contact_info back to individual fields for the return value
    let contactInfo: any = {};
    try {
      contactInfo = data.contact_info ? JSON.parse(data.contact_info) : {};
    } catch (e) {
      console.warn('Failed to parse contact_info for updated member:', data.id, e);
      contactInfo = {};
    }
    return {
      ...data,
      email: contactInfo.email,
      phone: contactInfo.phone,
      emergency_contact: contactInfo.emergency_contact,
      medical_info: contactInfo.medical_info
    };
  },

  async deleteMember(id: string): Promise<void> {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);
    
    if (error) handleError(error, 'Fout bij het verwijderen van lid');
  }
};

/**
 * Session Service
 */
export const sessionService = {
  async getAllSessions(): Promise<Session[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('start_time', { ascending: false });
    
    if (error) handleError(error, 'Fout bij het ophalen van sessies');
    return data || [];
  },
  async getSessionsByGroup(groupId: string): Promise<Session[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('group_id', groupId)
      .order('start_time', { ascending: false });
    
    if (error) handleError(error, 'Fout bij het ophalen van groepssessies');
    return data || [];
  },

  async createSession(session: {
    title: string;
    description?: string;
    group_id: string;
    start_time: string;
    end_time: string;
    location_id?: string;
    recurrence_type?: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
    recurrence_end_date?: string;
    parent_session_id?: string;
    created_by: string;
  }): Promise<Session> {
    // Always include all required columns for the sessions table
    const sessionData = {
      title: session.title,
      description: session.description || null,
      group_id: session.group_id,
      location_id: session.location_id || null,
      start_time: session.start_time,
      end_time: session.end_time,
      recurrence_type: session.recurrence_type || 'none',
      recurrence_end_date: session.recurrence_end_date || null,
      parent_session_id: session.parent_session_id || null,
      created_by: session.created_by
    };
    const { data, error } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select()
      .single();
    if (error) handleError(error, 'Fout bij het aanmaken van sessie');
    return data;
  },

  async createSessionWithTrainers(sessionData: {
    title: string;
    description?: string;
    group_id: string;
    start_time: string;
    end_time: string;
    location_id?: string;
    recurrence_type?: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
    recurrence_end_date?: string;
    created_by: string;
  }, trainerIds: string[]): Promise<Session> {
    // Set default recurrence type if not provided
    const recurrenceType = sessionData.recurrence_type || 'none';
    
    // Insert the main session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert([{
        ...sessionData,
        recurrence_type: recurrenceType,
        date: sessionData.start_time.split('T')[0] // Extract date from start_time
      }])
      .select()
      .single();

    if (sessionError) handleError(sessionError, 'Fout bij het aanmaken van sessie');

    // Voeg trainers toe aan de sessie
    if (trainerIds.length > 0) {
      const sessionTrainers = trainerIds.map(trainerId => ({
        session_id: session.id,
        user_id: trainerId
      }));

      const { error: trainersError } = await supabase
        .from('session_trainers')
        .insert(sessionTrainers);

      if (trainersError) handleError(trainersError, 'Fout bij het toewijzen van trainers');
    }
    
    // Create recurring sessions if needed
    if (recurrenceType !== 'none' && sessionData.recurrence_end_date) {
      await this.createRecurringSessions(
        session.id,
        {
          ...session,
          start_time: sessionData.start_time,
          end_time: sessionData.end_time
        },
        recurrenceType,
        new Date(sessionData.start_time),
        new Date(sessionData.recurrence_end_date),
        trainerIds
      );
    }

    return session;
  },
  
  async createRecurringSessions(
    parentId: string,
    baseSession: Session & { start_time: string; end_time: string },
    recurrenceType: 'daily' | 'weekly' | 'biweekly' | 'monthly',
    startDate: Date,
    endDate: Date,
    trainerIds: string[]
  ): Promise<void> {
    const recurringSessions = [];
    let currentDate = new Date(startDate);
    
    // Add interval to get the first occurrence
    currentDate = this.addIntervalToDate(currentDate, recurrenceType);
    
    while (currentDate <= endDate) {
      // Format dates properly for database
      const formattedStartTime = currentDate.toISOString();
      
      // Calculate end time by adding the same duration as the original session
      const endTime = new Date(currentDate);
      const originalStartTime = new Date(baseSession.start_time);
      const originalEndTime = new Date(baseSession.end_time);
      const originalDuration = originalEndTime.getTime() - originalStartTime.getTime();
      endTime.setTime(endTime.getTime() + originalDuration);
      
      const formattedEndTime = endTime.toISOString();
      const formattedDate = formattedStartTime.split('T')[0];
      
      // Create a session with reference to parent
      recurringSessions.push({
        title: baseSession.title,
        description: baseSession.description,
        group_id: baseSession.group_id,
        date: formattedDate,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        location_id: baseSession.location_id,
        parent_session_id: parentId,
        recurrence_type: recurrenceType,
        created_by: baseSession.created_by
      });
      
      // Move to the next occurrence
      currentDate = this.addIntervalToDate(currentDate, recurrenceType);
    }
    
    // Insert all recurring sessions at once
    if (recurringSessions.length > 0) {
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .insert(recurringSessions)
        .select();
      
      if (sessionsError) handleError(sessionsError, 'Fout bij het aanmaken van herhalende sessies');
      
      // Add trainers to all recurring sessions
      if (sessions && sessions.length > 0 && trainerIds.length > 0) {
        const sessionTrainersArray: { session_id: string; user_id: string }[] = [];
        
        sessions.forEach(session => {
          trainerIds.forEach(trainerId => {
            sessionTrainersArray.push({
              session_id: session.id,
              user_id: trainerId
            });
          });
        });
        
        const { error: trainersError } = await supabase
          .from('session_trainers')
          .insert(sessionTrainersArray);
        
        if (trainersError) handleError(trainersError, 'Fout bij het toewijzen van trainers aan herhalende sessies');
      }
    }
  },
  
  getRecurrenceInterval(recurrenceType: 'daily' | 'weekly' | 'biweekly' | 'monthly'): number {
    switch (recurrenceType) {
      case 'daily': return 1; // 1 day
      case 'weekly': return 7; // 7 days
      case 'biweekly': return 14; // 14 days
      case 'monthly': return 30; // Approximately 30 days
      default: return 0;
    }
  },
  
  addIntervalToDate(date: Date, recurrenceType: 'daily' | 'weekly' | 'biweekly' | 'monthly'): Date {
    const newDate = new Date(date);
    
    switch (recurrenceType) {
      case 'daily':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'biweekly':
        newDate.setDate(newDate.getDate() + 14);
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    
    return newDate;
  },

  async getSessionsWithDetails(): Promise<any[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        groups (
          id,
          name
        ),
        locations (
          id,
          name,
          address
        ),
        session_trainers (
          users (
            id,
            name,
            email
          )
        )
      `)
      .order('start_time', { ascending: true });

    if (error) handleError(error, 'Fout bij het ophalen van sessies');
    return data || [];
  }
};

/**
 * Exercise Service
 */
export const exerciseService = {
  async getAllExercises(): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*');
    
    if (error) handleError(error, 'Fout bij het ophalen van oefeningen');
    return data || [];
  },

  async createExercise(exercise: {
    name: string;
    description?: string;
    category: string;
    difficulty_level: number;
    instructions?: string;
  }): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .insert([exercise])
      .select()
      .single();
    
    if (error) handleError(error, 'Fout bij het aanmaken van oefening');
    return data;
  },

  async completeExercise(completedExercise: {
    session_id: string;
    exercise_id: string;
    sets?: number;
    reps?: number;
    duration_minutes?: number;
    notes?: string;
  }): Promise<CompletedExercise> {
    const { data, error } = await supabase
      .from('completed_exercises')
      .insert([{
        ...completedExercise,
        completed_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) handleError(error, 'Fout bij het registreren van oefening');
    return data;
  }
};

/**
 * Attendance Service
 */
export const attendanceService = {
  async getAttendanceBySession(sessionId: string): Promise<Attendance[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('session_id', sessionId);
    
    if (error) handleError(error, 'Fout bij het ophalen van aanwezigheid');
    return data || [];
  },
  async recordBulkAttendance(
    sessionId: string,
    records: Array<{
      memberId: string;
      status: 'present' | 'absent' | 'late' | 'excused';
      note?: string;
    }>,
    recordedBy: string
  ): Promise<void> {
    const attendanceRecords = records.map(record => ({
      session_id: sessionId,
      member_id: record.memberId,
      present: record.status === 'present', // Convert status to boolean for database
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('attendance')
      .upsert(attendanceRecords, {
        onConflict: 'session_id,member_id'
      });
    
    if (error) handleError(error, 'Fout bij het opslaan van aanwezigheid');
  }
};

/**
 * Location Service
 */
// Location service validatie helpers
const validateLocationName = (name: string): void => {
  if (!name || name.trim().length === 0) {
    throw new Error('Locatienaam is verplicht');
  }
  if (name.length > 100) {
    throw new Error('Locatienaam mag niet langer zijn dan 100 karakters');
  }
};

const validateLocationAddress = (address: string | undefined): void => {
  if (address && address.length > 200) {
    throw new Error('Adres mag niet langer zijn dan 200 karakters');
  }
};

const validateLocationDescription = (description: string | undefined): void => {
  if (description && description.length > 500) {
    throw new Error('Beschrijving mag niet langer zijn dan 500 karakters');
  }
};

export const locationService = {
  async getAllLocations(): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name');
    
    if (error) handleError(error, 'Fout bij het ophalen van locaties');
    return data || [];
  },

  async getLocationById(id: string): Promise<Location | null> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      handleError(error, 'Fout bij het ophalen van locatie');
    }
    return data;
  },

  async createLocation(location: Omit<Location, 'id' | 'created_at' | 'updated_at'>): Promise<Location> {
    // Valideer de input
    validateLocationName(location.name);
    validateLocationAddress(location.address);
    validateLocationDescription(location.description);

    const { data, error } = await supabase
      .from('locations')
      .insert([location])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        throw new Error('Er bestaat al een locatie met deze naam');
      }
      handleError(error, 'Fout bij het aanmaken van locatie');
    }
    return data;
  },

  async updateLocation(id: string, updates: Partial<Omit<Location, 'id' | 'created_at' | 'updated_at'>>): Promise<Location> {
    if (updates.name) validateLocationName(updates.name);
    if (updates.address) validateLocationAddress(updates.address);
    if (updates.description) validateLocationDescription(updates.description);

    const { data, error } = await supabase
      .from('locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        throw new Error('Er bestaat al een locatie met deze naam');
      }
      handleError(error, 'Fout bij het bijwerken van locatie');
    }
    return data;
  },
  async deleteLocation(id: string): Promise<void> {
    // Check eerst of de locatie in gebruik is
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id')
      .eq('location_id', id)
      .limit(1);

    if (sessionsError) handleError(sessionsError, 'Fout bij controleren van sessies');

    if (sessions && sessions.length > 0) {
      throw new Error('Deze locatie kan niet verwijderd worden omdat er nog sessies aan gekoppeld zijn');  
    }

    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);
    
    if (error) handleError(error, 'Fout bij het verwijderen van locatie');
  }
};

/**
 * All services combined
 */
export const bvfServices = {
  users: userService,
  groups: groupService,
  members: memberService,
  sessions: sessionService,
  exercises: exerciseService,
  attendance: attendanceService,
  locations: locationService
};

export const fetchMembers = async (): Promise<Member[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_URL}/values/Members!A2:F`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch members');
    }
    
    const data = await response.json();
    return data.values?.map((row: any[]) => ({
      id: row[0] || '',
      name: row[1] || '',
      date_of_birth: row[2] || '',
      contact_info: row[3] || '',
      emergency_contact: row[4] || '',
      medical_info: row[5] || ''
    })) || [];
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
};

export const fetchSessions = async (): Promise<Session[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_URL}/values/Sessions!A2:J`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }
    
    const data = await response.json();
    return data.values?.map((row: any[]) => ({
      id: row[0] || '',
      title: row[1] || '',
      description: row[2] || '',
      start_time: row[3] || '',
      end_time: row[4] || '',
      location: row[5] || '',
      trainer_id: row[6] || '',
      group_id: row[7] || '',
      max_participants: parseInt(row[8]) || 0,
      status: row[9] || 'scheduled'
    })) || [];
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
};

export async function getMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching members:', error);
    throw error;
  }

  // Ensure we return the correct type
  return (data || []) as Member[];
}
