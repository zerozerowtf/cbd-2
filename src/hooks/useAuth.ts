import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (session?.user) {
        const isAdmin = await checkAdminStatus(session.user);
        setIsAuthenticated(isAdmin);
        setUser(session.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error('Session check error:', err);
      setError(err instanceof Error ? err.message : 'Session check failed');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthChange = async (event: string, session: any) => {
    if (event === 'SIGNED_OUT') {
      setIsAuthenticated(false);
      setUser(null);
      window.location.href = '/login';
      return;
    }

    if (session?.user) {
      const isAdmin = await checkAdminStatus(session.user);
      setIsAuthenticated(isAdmin);
      setUser(session.user);
    }
  };

  const checkAdminStatus = async (user: User): Promise<boolean> => {
    try {
      // Check role in multiple locations
      const isAdmin = 
        user.role === 'admin' ||
        user.app_metadata?.role === 'admin' ||
        user.user_metadata?.role === 'admin';

      if (!isAdmin) {
        // Double check with database
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        return data?.role === 'admin';
      }

      return isAdmin;
    } catch (err) {
      console.error('Admin check error:', err);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      if (!data.user) throw new Error('No user returned from sign in');

      const isAdmin = await checkAdminStatus(data.user);
      if (!isAdmin) {
        await supabase.auth.signOut();
        throw new Error('Insufficient permissions. Admin access required.');
      }

      return data;
    } catch (err) {
      console.error('Sign in error:', err);
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      throw new Error(message);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setIsAuthenticated(false);
      setUser(null);
      window.location.href = '/login';
    } catch (err) {
      console.error('Sign out error:', err);
      // Force redirect on error
      window.location.href = '/login';
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    signIn,
    signOut,
  };
};
