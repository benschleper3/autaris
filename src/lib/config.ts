import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://gjfbxqsjxasubvnpeeie.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZmJ4cXNqeGFzdWJ2bnBlZWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTU4MzIsImV4cCI6MjA3MTczMTgzMn0.HPRrUtWLV-aruEFGIdL1wis-ffsvSx_a5vr64RSYDIc"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)