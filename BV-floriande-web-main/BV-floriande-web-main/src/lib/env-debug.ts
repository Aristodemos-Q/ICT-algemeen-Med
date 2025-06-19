// Debug script to test environment variables
console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
console.log('NEXT_PUBLIC_DEBUG:', process.env.NEXT_PUBLIC_DEBUG);

// Test if the variables are accessible
const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Environment check result:', { hasUrl, hasKey });

export { hasUrl, hasKey };
