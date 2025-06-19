/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { createLogger } from './logger';

const logger = createLogger('database:transaction');

/**
 * Type definition for transaction function
 */
export type TransactionFunction<T> = (
  client: SupabaseClient
) => Promise<T>;

/**
 * Execute a transaction using PostgreSQL's BEGIN/COMMIT/ROLLBACK
 * 
 * @param fn The function to execute within the transaction
 * @returns The result of the transaction function
 */
export async function executeTransaction<T>(fn: TransactionFunction<T>): Promise<T> {
  // Start a transaction
  try {
    await supabase.rpc('begin_transaction');
    logger.debug('Transaction started');
    
    // Execute the transaction function
    const result = await fn(supabase);
    
    // Commit the transaction
    await supabase.rpc('commit_transaction');
    logger.debug('Transaction committed');
    
    return result;
  } catch (error) {
    // Rollback the transaction on error
    try {
      await supabase.rpc('rollback_transaction');
      logger.debug('Transaction rolled back');
    } catch (rollbackError) {
      logger.error('Failed to rollback transaction', rollbackError);
    }
    
    // Re-throw the original error
    if (error instanceof Error) {
      logger.error(`Transaction error: ${error.message}`, error);
    } else {
      logger.error('Unknown transaction error', error);
    }
    throw error;
  }
}
