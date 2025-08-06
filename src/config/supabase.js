import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jbjqxxfaorxtitvmpotp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpianF4eGZhb3J4dGl0dm1wb3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDUyODksImV4cCI6MjA2MzMyMTI4OX0.9jUHGZKbpZymm0f5UTngBdx5e90Xo5cNyVTGe9VQoNs';

export const supabase = createClient(supabaseUrl, supabaseKey); 