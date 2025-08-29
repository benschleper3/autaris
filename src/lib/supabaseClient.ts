import { createClient } from '@supabase/supabase-js';

// Note: Adapted for Vite - using hardcoded values since this is frontend
export const supabase = createClient(
  'https://gjfbxqsjxasubvnpeeie.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZmJ4cXNqeGFzdWJ2bnBlZWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTU4MzIsImV4cCI6MjA3MTczMTgzMn0.HPRrUtWLV-aruEFGIdL1wis-ffsvSx_a5vr64RSYDIc'
);