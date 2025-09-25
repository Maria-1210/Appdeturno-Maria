import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvkimjcnwvfjelnnzsnb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2a2ltamNud3ZmamVsbm56c25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNzExNDgsImV4cCI6MjA3Mjk0NzE0OH0.7_FlcBCI5vQhbR-MvJNlaZEkzjN6T7NeHMzccZL0lq4';

export const supabase = createClient(supabaseUrl, supabaseKey);
