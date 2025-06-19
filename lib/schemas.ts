/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

import { z } from 'zod';

/**
 * User query params schema
 */
export const UserQuerySchema = z.object({
  role: z.string().optional(),
  status: z.string().optional(),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20)
});

/**
 * User creation schema
 */
export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  role: z.enum(['trainer', 'member', 'admin']).default('member'),
  phone: z.string().optional().nullable(),
  emergency_contact: z.string().optional().nullable(),
  medical_info: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active')
});

/**
 * User update schema
 */
export const UpdateUserSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Valid email is required').optional(),
  role: z.enum(['trainer', 'member', 'admin']).optional(),
  phone: z.string().optional().nullable(),
  emergency_contact: z.string().optional().nullable(),
  medical_info: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'suspended']).optional()
});

/**
 * Training group query params schema
 */
export const GroupQuerySchema = z.object({
  trainer_id: z.string().optional(),
  status: z.string().optional(),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20)
});

/**
 * Training group creation schema
 */
export const CreateGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  level: z.string().optional().nullable(),
  age_category: z.string().optional().nullable(),
  max_members: z.number().int().positive('Max members must be positive').optional().default(15),
  created_by: z.string().min(1, 'Creator ID is required')
});

/**
 * Group trainer assignment schema
 */
export const AssignTrainerSchema = z.object({
  group_id: z.string().min(1, 'Group ID is required'),
  trainer_id: z.string().min(1, 'Trainer ID is required'),
  assigned_by: z.string().min(1, 'Assigned by is required')
});

/**
 * Training session query params schema
 */
export const SessionQuerySchema = z.object({
  groupId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 100)
});

/**
 * Training session creation schema
 */
export const CreateSessionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  location_id: z.string().min(1, 'Location ID is required'),
  group_id: z.string().min(1, 'Group ID is required'),
  created_by: z.string().min(1, 'Created by is required')
});

/**
 * Attendance recording schema
 */
export const RecordAttendanceSchema = z.object({
  session_id: z.string().min(1, 'Session ID is required'),
  user_id: z.string().min(1, 'User ID is required'),
  status: z.enum(['present', 'absent', 'late']),
  notes: z.string().optional().nullable()
});

/**
 * Group evaluation creation schema
 */
export const CreateGroupEvaluationSchema = z.object({
  evaluation_date: z.string().min(1, 'Evaluation date is required'),
  strengths: z.string().optional().nullable(),
  areas_for_improvement: z.string().optional().nullable(),
  recommended_exercises: z.array(z.string()).optional().nullable(),
  next_goals: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  evaluator_id: z.string().min(1, 'Evaluator ID is required')
});

/**
 * Exercise creation schema
 */
export const CreateExerciseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  duration_minutes: z.number().int().positive().optional().nullable(),
  equipment_needed: z.string().optional().nullable(),
  instructions: z.string().min(1, 'Instructions are required')
});
