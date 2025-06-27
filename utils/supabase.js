import { createClient } from "@supabase/supabase-js";
import { useRuntimeConfig } from 'nuxt/app';

// Singleton instance
let supabaseInstance = null;

// Create a Supabase client with singleton pattern
export const createSupabaseClient = () => {
  // Return existing instance if already created
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  // This function should be called inside setup(), plugins, or middleware
  const config = useRuntimeConfig();
  
  // Check if Supabase URL and key are available
  if (!config.public.supabaseUrl) {
    console.error('Supabase URL is missing. Check your environment variables.');
    throw new Error('Supabase URL is required');
  }
  
  if (!config.public.supabaseKey) {
    console.error('Supabase key is missing. Check your environment variables.');
    throw new Error('Supabase key is required');
  }
  
  // Create the client only once
  supabaseInstance = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  );
  
  return supabaseInstance;
};

// For components to use Supabase
export const useSupabase = () => {
  return createSupabaseClient();
};