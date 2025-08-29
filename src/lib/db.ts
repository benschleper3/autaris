// WARNING: This file is for server-side use only and will not work in the browser
// This is a Vite/React frontend project - pg Pool connections are for Node.js servers
// If you need database access, use the Supabase client instead

// Commented out to avoid TypeScript errors in frontend project
// import { Pool } from 'pg';

// export const db = new Pool({ 
//   connectionString: process.env.DATABASE_URL 
// });

// Placeholder export to make this a valid module
export const db = null;

// Note: In a Vite project, you would typically use Supabase client for database operations:
// import { supabase } from './supabaseClient';
// const { data, error } = await supabase.from('table_name').select('*');