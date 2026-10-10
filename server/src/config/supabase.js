const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const rawUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Clean up URL: remove trailing /rest/v1 or trailing slashes if present
const supabaseUrl = rawUrl ? rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '') : '';

if (!supabaseUrl) {
  console.warn('⚠️ Warning: SUPABASE_URL is not set in server environment variables.');
}

// Client for verifying user JWTs
const supabaseAuth = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'placeholder-anon-key'
);

// Admin client with service_role key to bypass RLS for trusted backend operations
const supabaseAdmin = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseServiceRoleKey || supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

module.exports = {
  supabaseAuth,
  supabaseAdmin
};
