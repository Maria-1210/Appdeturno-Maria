import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://';
const supabaseKey = '';

export const supabase = createClient(supabaseUrl, supabaseKey);
