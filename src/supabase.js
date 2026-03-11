import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yzbtflpuxlkutasgdnrq.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YnRmbHB1eGxrdXRhc2dkbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxOTEyNzksImV4cCI6MjA4ODc2NzI3OX0.4G1N7c5fDAw2Pt1ll97yjRt2lLzuIKQmKUxvXToG1io'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)