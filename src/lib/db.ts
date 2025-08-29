// Note: This is a Vite/React frontend project - pg Pool connections won't work in the browser
// For database access, use the Supabase client instead: import { supabase } from './supabaseClient'

// Commented out to avoid errors - this would only work in a Node.js server environment
// import { Pool } from 'pg';
// export const db = new Pool({ connectionString: process.env.DATABASE_URL! });

// For reference - this is what you'd use in a Node.js backend:
export const dbConnectionString = 'postgresql://postgres:vqnNhBVDDNhs4xhY@db.gjfbxqsjxasubvnpeeie.supabase.co:5432/postgres';

// Placeholder export to make this a valid module
export const db = null;

// Note: In a Vite project, you would typically use Supabase client for database operations:
// import { supabase } from './supabaseClient';
// const { data, error } = await supabase.from('table_name').select('*');