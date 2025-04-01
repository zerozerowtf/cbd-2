import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-client-info': 'casa-di-barbara@1.0.0',
    },
  },
});

// Add auth state change listener for debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user);

  // Handle sign out
  if (event === 'SIGNED_OUT') {
    console.log('User signed out');
    // Clear any cached data
    localStorage.removeItem('supabase.auth.token');
    // Redirect to login page
    window.location.href = '/login';
    return;
  }

  // Handle sign in
  if (event === 'SIGNED_IN' && session?.user) {
    console.log('User signed in:', session.user);
  }
});

// Export helper for checking admin status
export const isAdmin = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    // Check for admin role in JWT claims
    return session?.user?.role === 'admin' || 
           session?.user?.app_metadata?.role === 'admin' ||
           session?.user?.user_metadata?.role === 'admin';
  } catch (err) {
    console.error('Error checking admin status:', err);
    return false;
  }
};

// Export helper for signing out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear any cached data
    localStorage.removeItem('supabase.auth.token');
    
    // Redirect to login page
    window.location.href = '/login';
  } catch (err) {
    console.error('Error signing out:', err);
    // Force redirect on error
    window.location.href = '/login';
  }
};
