'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { alert, notify } from '@/components/ui/notifications';

export default function DatabaseDiagnosticPage() {
  const [diagnosticResults, setDiagnosticResults] = useState<{
    ping: boolean;
    serviceStatus: boolean;
    execSql: boolean;
    tables: boolean;
  }>({
    ping: false,
    serviceStatus: false,
    execSql: false,
    tables: false,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  async function runDiagnostics() {
    setIsRunning(true);
    setErrorDetails(null);
    
    const results = {
      ping: false,
      serviceStatus: false,
      execSql: false,
      tables: false,
    };

    try {
      // Test 1: Check ping function
      const pingResult = await supabase.rpc('ping');
      results.ping = !pingResult.error;
      
      // Test 2: Check service status function (now returns jsonb)
      const serviceResult = await supabase.rpc('get_service_status');
      results.serviceStatus = !serviceResult.error && serviceResult.data?.status;
      
      // Test 3: Check exec_sql function
      const execSqlResult = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
      results.execSql = !execSqlResult.error;
      
      if (execSqlResult.error) {
        setErrorDetails(`exec_sql error: ${execSqlResult.error.message}`);
      }
      
      // Test 4: Check if users table exists
      const tableResult = await supabase.from('users').select('count(*)').limit(1);
      results.tables = !tableResult.error;
      
      setDiagnosticResults(results);
      
      // Summary notification
      if (Object.values(results).every(result => result)) {
        notify('All database diagnostic tests passed successfully!', 'success');
      } else {
        alert('Some database tests failed. See details below.', 'warning');
      }
    } catch (err: any) {
      setErrorDetails(`Unexpected error: ${err.message}`);
      alert('Error running diagnostics', 'error');
    } finally {
      setIsRunning(false);
    }
  }
  function getFixInstructions() {
    if (diagnosticResults.execSql === false) {
      // Check if it's a permission error
      const isPermissionError = errorDetails && errorDetails.includes('Permission denied');
      
      return (
        <div className="mt-4 bg-amber-50 border border-amber-200 p-4 rounded-md">
          <h3 className="text-amber-800 font-bold mb-2">
            {isPermissionError ? 
              "How to Fix exec_sql Function Permissions" : 
              "How to Fix exec_sql Function"}
          </h3>
          
          {isPermissionError ? (
            <>
              <p className="mb-2">The exec_sql function exists but you don't have permission to use it.</p>
              <p className="font-bold">For Local Development:</p>
              <ol className="list-decimal ml-6 mb-3">
                <li>Run <code className="bg-gray-100 px-1 rounded">apply-migration.bat</code> file</li>
                <li>This will apply the permission fix in <code className="bg-gray-100 px-1 rounded">20250522_fix_exec_sql_permissions.sql</code></li>
                <li>Restart your application</li>
              </ol>
              <p className="font-bold">For Remote/Production:</p>
              <ol className="list-decimal ml-6">
                <li>Go to Supabase SQL Editor</li>
                <li>Run the migration file: <code className="bg-gray-100 px-1 rounded">supabase/migrations/20250522_fix_exec_sql_permissions.sql</code></li>
                <li>Restart your application</li>
              </ol>
            </>
          ) : (
            <>
              <p className="mb-2">The exec_sql function is required for database setup operations.</p>
              <p className="font-bold">For Local Development:</p>
              <ol className="list-decimal ml-6 mb-3">
                <li>Run <code className="bg-gray-100 px-1 rounded">apply-migration.bat</code> file</li>
                <li>Restart your application</li>
              </ol>
              <p className="font-bold">For Remote/Production:</p>
              <ol className="list-decimal ml-6">
                <li>Go to Supabase SQL Editor</li>
                <li>Run the migration file: <code className="bg-gray-100 px-1 rounded">supabase/migrations/20250521_add_exec_sql_function.sql</code></li>
                <li>Restart your application</li>
              </ol>
            </>
          )}
          
          <p className="mt-2">
            <a 
              href="/DATABASE-SETUP-FIX.md" 
              target="_blank" 
              className="text-blue-600 hover:text-blue-800"
            >
              View detailed documentation
            </a>
          </p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Database Diagnostics</h1>
      
      <div className="mb-6">
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isRunning ? 'Running Tests...' : 'Run Database Diagnostics'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border rounded-md p-4 bg-white">
          <h2 className="font-semibold mb-2">Connection Tests</h2>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className={`w-5 h-5 inline-flex items-center justify-center rounded-full mr-2 ${
                diagnosticResults.ping ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {diagnosticResults.ping ? '✓' : '•'}
              </span>
              Database Ping Function
            </li>
            <li className="flex items-center">
              <span className={`w-5 h-5 inline-flex items-center justify-center rounded-full mr-2 ${
                diagnosticResults.serviceStatus ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {diagnosticResults.serviceStatus ? '✓' : '•'}
              </span>
              Service Status Function
            </li>
          </ul>
        </div>
        
        <div className="border rounded-md p-4 bg-white">
          <h2 className="font-semibold mb-2">Schema Tests</h2>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className={`w-5 h-5 inline-flex items-center justify-center rounded-full mr-2 ${
                diagnosticResults.execSql ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {diagnosticResults.execSql ? '✓' : '✗'}
              </span>
              <span className={diagnosticResults.execSql ? '' : 'font-semibold text-red-600'}>
                exec_sql Function Available
              </span>
            </li>
            <li className="flex items-center">
              <span className={`w-5 h-5 inline-flex items-center justify-center rounded-full mr-2 ${
                diagnosticResults.tables ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {diagnosticResults.tables ? '✓' : '•'}
              </span>
              Users Table Exists
            </li>
          </ul>
        </div>
      </div>
      
      {errorDetails && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md">
          <h3 className="font-semibold text-red-700 mb-1">Error Details</h3>
          <pre className="whitespace-pre-wrap text-sm bg-white p-2 rounded border border-red-100">
            {errorDetails}
          </pre>
        </div>
      )}
      
      {getFixInstructions()}
      
      <div className="mt-6 text-sm text-gray-500">
        <p>
          These diagnostics check your database connection and required functions.
          If you encounter issues, please refer to the project documentation or contact support.
        </p>
      </div>
    </div>
  );
}
