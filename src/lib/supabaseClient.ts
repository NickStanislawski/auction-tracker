import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Add them to a .env file " +
      "at the project root (see .env.example) or sign-in/sync calls will fail."
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
