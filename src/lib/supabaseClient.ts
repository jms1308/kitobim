import { createClient } from '@supabase/supabase-js'

// Muhim: Bu qiymatlarni to'g'ridan-to'g'ri kodga yozmang.
// Loyihangiz ildizida .env.local nomli fayl yarating va unga quyidagilarni joylashtiring:
// NEXT_PUBLIC_SUPABASE_URL=SIZNING_SUPABASE_URL
// NEXT_PUBLIC_SUPABASE_ANON_KEY=SIZNING_SUPABASE_ANON_KEY

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Supabase URL and Anon Key must be provided in .env.local file')
// }

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)
