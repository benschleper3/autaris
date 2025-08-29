import { createClient } from '@supabase/supabase-js';

// Note: Using import.meta.env for Vite environment variables
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://gjfbxqsjxasubvnpeeie.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZmJ4cXNqeGFzdWJ2bnBlZWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTU4MzIsImV4cCI6MjA3MTczMTgzMn0.HPRrUtWLV-aruEFGIdL1wis-ffsvSx_a5vr64RSYDIc'
);