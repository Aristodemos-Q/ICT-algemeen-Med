/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { cache } from './cache';

// Type definition for transaction function
type TransactionFunction<T> = (
  client: SupabaseClient
) => Promise<T>;

/**
 * Pagination parameters for database queries
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Pagination result metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Base database helper with common CRUD operations
 */
export class DatabaseHelper<T extends Record<string, any>> {
  private table: string;

  constructor(tableName: string) {
    this.table = tableName;
  }
  
  /**
   * Invalidate cache entries related to a specific record
   * @param id The record ID
   */
  protected invalidateCache(id: string | number): void {
    // Clear specific cache keys for this record
    cache.delete(`${this.table}:${id}`);
    cache.delete(`${this.table}:${id}:details`);
    
    // Clear list caches for this table
    cache.deleteByPrefix(`${this.table}:list:`);
    cache.deleteByPrefix(`${this.table}s:list:`); // For pluralized names
  }

  /**
   * Get a basic query builder for this table
   */
  query() {
    return supabase.from(this.table);
  }  /**
   * Apply pagination to a query
   */
  paginate<TData>(
    query: PostgrestFilterBuilder<any, any, any, any, TData>, 
    pagination: PaginationParams
  ) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const offset = (page - 1) * limit;

    return query
      .range(offset, offset + limit - 1)
      .limit(limit);
  }

  /**
   * Get all records with pagination
   */
  async getAll(
    pagination: PaginationParams = {}, 
    filters: Record<string, any> = {}
  ): Promise<{
    data: T[];
    pagination: PaginationMeta;
  }> {
    // Start with a count query to get total
    const countQuery = this.query().select('*', { count: 'exact', head: true });
    
    // Apply filters if any
    let filteredCountQuery = countQuery;
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        filteredCountQuery = filteredCountQuery.eq(key, value);
      }
    });
    
    const { count, error: countError } = await filteredCountQuery;

    if (countError) {
      throw new Error(`Failed to count ${this.table}: ${countError.message}`);
    }

    // Now do the actual data query with pagination
    let query = this.query().select('*');

    // Apply the same filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    // Apply pagination
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    query = this.paginate(query, { page, limit });

    // Execute query
    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch ${this.table}: ${error.message}`);
    }

    return {
      data: data as T[],
      pagination: {
        total: count || 0,
        page,
        limit,
        pages: count ? Math.ceil(count / limit) : 0
      }
    };
  }

  /**
   * Get a single record by ID
   */
  async getById(id: string | number): Promise<T | null> {
    const { data, error } = await this.query()
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      throw new Error(`Failed to fetch ${this.table} with id ${id}: ${error.message}`);
    }

    return data as T;
  }  /**
   * Create a new record
   */
  async create(payload: Partial<T>): Promise<T> {
    // Add timestamps if not present
    const data = {
      ...payload,
      created_at: payload.created_at || new Date().toISOString()
    };

    try {
      const { data: result, error } = await this.query()
        .insert([data])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create ${this.table}: ${error.message}`);
      }
      
      // Invalidate list caches since we added a new record
      cache.deleteByPrefix(`${this.table}:list:`);
      cache.deleteByPrefix(`${this.table}s:list:`); // For pluralized names

      return result as T;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create ${this.table}: ${error.message}`);
      }
      throw error;
    }
  }
    /**
   * Create multiple records in a batch
   */
  async createMany(payloads: Partial<T>[]): Promise<T[]> {
    if (!payloads.length) return [];
    
    // Add timestamps to all records
    const data = payloads.map(payload => ({
      ...payload,
      created_at: payload.created_at || new Date().toISOString()
    }));

    try {
      const { data: result, error } = await this.query()
        .insert(data)
        .select();

      if (error) {
        throw new Error(`Failed to create ${this.table} batch: ${error.message}`);
      }
      
      // Invalidate list caches since we added new records
      cache.deleteByPrefix(`${this.table}:list:`);
      cache.deleteByPrefix(`${this.table}s:list:`); // For pluralized names

      return result as T[];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create ${this.table} batch: ${error.message}`);
      }
      throw error;
    }
  }
  /**
   * Update an existing record
   */
  async update(id: string | number, payload: Partial<T>): Promise<T | null> {
    // Add updated timestamp
    const data = {
      ...payload,
      updated_at: new Date().toISOString()
    };

    // Remove fields that shouldn't be directly updated
    delete data.id;
    delete data.created_at;

    const { data: result, error } = await this.query()
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update ${this.table} with id ${id}: ${error.message}`);
    }
    
    // Invalidate cache entries related to this record
    this.invalidateCache(id);

    return result as T;
  }
  /**
   * Delete a record
   */
  async delete(id: string | number): Promise<void> {
    const { error } = await this.query()
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete ${this.table} with id ${id}: ${error.message}`);
    }
    
    // Invalidate cache entries related to this record
    this.invalidateCache(id);
  }
}
