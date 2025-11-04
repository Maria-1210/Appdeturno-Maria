import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://unyvdepmjosgxnsczkgf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueXZkZXBtam9zZ3huc2N6a2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTYxODIsImV4cCI6MjA2OTM5MjE4Mn0.LNaHG360SX-XH3Gsc3tx5JCTv4GCrKOmrsvWNDo9knE';

export const supabase = createClient(supabaseUrl, supabaseKey);
