'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestSupabaseConnection() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [environmentVars, setEnvironmentVars] = useState<any>({});

  useEffect(() => {
    async function testConnection() {
      try {
        // Check environment variables (client-side only gets NEXT_PUBLIC_* vars)
        const envVars = {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          debug: process.env.NEXT_PUBLIC_DEBUG,
          nodeEnv: process.env.NODE_ENV
        };
        setEnvironmentVars(envVars);

        console.log('Environment variables:', envVars);

        // Test Supabase connection
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase connection error:', error);
          setConnectionStatus(`Connection Error: ${error.message}`);
        } else {
          console.log('Supabase connection successful');
          setConnectionStatus('✅ Connection Successful!');
        }
      } catch (error) {
        console.error('Test failed:', error);
        setConnectionStatus(`Test Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
          <ul className="space-y-1">
            <li>NEXT_PUBLIC_SUPABASE_URL: <span className={environmentVars.supabaseUrl ? 'text-green-600' : 'text-red-600'}>
              {environmentVars.supabaseUrl ? `Set (${environmentVars.supabaseUrl.substring(0, 30)}...)` : 'NOT SET'}
            </span></li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: <span className={environmentVars.supabaseKey ? 'text-green-600' : 'text-red-600'}>
              {environmentVars.supabaseKey ? `Set (${environmentVars.supabaseKey.substring(0, 30)}...)` : 'NOT SET'}
            </span></li>
            <li>NODE_ENV: {environmentVars.nodeEnv || 'development'}</li>
            <li>DEBUG: {environmentVars.debug || 'true'}</li>
          </ul>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
          <p className={connectionStatus.includes('✅') ? 'text-green-600' : connectionStatus.includes('Error') ? 'text-red-600' : 'text-yellow-600'}>
            {connectionStatus}
          </p>
        </div>

        <div className="mt-6">
          <a 
            href="/login" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Login Page
          </a>
        </div>
      </div>
    </div>
  );
}
