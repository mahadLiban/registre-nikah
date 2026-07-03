import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Remplacez ces deux valeurs par celles de votre projet Supabase
// (supabase.com → votre projet → Settings → API).
const SUPABASE_URL = "https://xpvkxzcmgmcapfeesluz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vz7h6In5LLuLqH540e6dPg_NmuZUJmG";

export const supabaseEstConfiguree = !SUPABASE_URL.includes("VOTRE-PROJET");

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Profile = {
  id: string;
  nom: string;
  mosquee: string;
  created_at: string;
};
