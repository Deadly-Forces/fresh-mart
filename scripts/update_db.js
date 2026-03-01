const fs = require('fs');
const file = 'e:/Programming/Projects/Grocery/fresh-mart/supabase/migrations/20240101000000_init_schema.sql';
let data = fs.readFileSync(file, 'utf8');
const lines = data.split(/\r?\n/);
const safePolicies = [
    'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;',
    'DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;',
    'CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);',
    'DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;',
    'CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);',
    'DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;',
    'CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);',
    'DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;',
    'CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);',
    '-- Drop recursive policies that might exist in the dashboard',
    'DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;',
    'DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;'
];
// replace lines 205-211 (0-indexed: 204 to 210 -> 7 lines)
lines.splice(204, 7, ...safePolicies);
fs.writeFileSync(file, lines.join('\n'));
console.log('Updated init_schema.sql!');
