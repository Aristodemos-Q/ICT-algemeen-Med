import { supabase } from '../lib/supabaseClient';

export default function TestSupabasePage() {
  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      console.log('Supabase client:', supabase);
      console.log('Environment in browser:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
      });

      // Test a simple query
      const { data, error } = await supabase
        .from('groups')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Supabase error:', {
          message: error.message,
          details: error.details,
          code: error.code,
          hint: error.hint
        });
      } else {
        console.log('Supabase test successful:', data);
      }
    } catch (err) {
      console.error('Test exception:', err);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <button 
        onClick={testConnection}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Test Connection
      </button>
      <div className="mt-4">
        <p>Check the browser console for results.</p>
      </div>
    </div>
  );
}
