const functions = require('firebase-functions');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase with Firebase config
const config = functions.config();
const supabaseUrl = config.supabase?.url || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = config.supabase?.service_key || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Please set Firebase config or environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '3600',
};

// Handle CORS preflight
const handleCors = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.set(corsHeaders);
    res.status(204).send('');
    return true;
  }
  res.set(corsHeaders);
  return false;
};

// API Routes
exports.api = functions.https.onRequest((req, res) => {
  if (handleCors(req, res)) return;

  const path = req.path;
  
  try {
    if (path === '/appointment-types') {
      return handleAppointmentTypes(req, res);
    } else if (path === '/practice-locations') {
      return handlePracticeLocations(req, res);
    } else if (path === '/appointment-requests') {
      return handleAppointmentRequests(req, res);
    } else if (path === '/user-appointments') {
      return handleUserAppointments(req, res);
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Appointment Types Handler
async function handleAppointmentTypes(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('appointment_types')
      .select('*')
      .order('name');

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Error fetching appointment types:', error);
    res.status(500).json({ error: 'Failed to fetch appointment types' });
  }
}

// Practice Locations Handler
async function handlePracticeLocations(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('practice_locations')
      .select('*')
      .order('name');

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Error fetching practice locations:', error);
    res.status(500).json({ error: 'Failed to fetch practice locations' });
  }
}

// Appointment Requests Handler
async function handleAppointmentRequests(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('appointment_requests')
        .select(`
          *,
          appointment_type:appointment_types(name, duration),
          practice_location:practice_locations(name, address)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.status(200).json(data || []);
    } catch (error) {
      console.error('Error fetching appointment requests:', error);
      res.status(500).json({ error: 'Failed to fetch appointment requests' });
    }
  } else if (req.method === 'POST') {
    try {
      const appointmentData = req.body;
      
      const { data, error } = await supabase
        .from('appointment_requests')
        .insert([{
          ...appointmentData,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (error) {
      console.error('Error creating appointment request:', error);
      res.status(500).json({ error: 'Failed to create appointment request' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// User Appointments Handler
async function handleUserAppointments(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('appointment_requests')
      .select(`
        *,
        appointment_type:appointment_types(name, duration),
        practice_location:practice_locations(name, address)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    res.status(500).json({ error: 'Failed to fetch user appointments' });
  }
}
