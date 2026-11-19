import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch application profile from public.profiles table
  async function fetchProfile(userId) {
    if (!userId) {
      setProfile(null);
      return null;
    }

    try {
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Enforce 3.5s timeout on profile lookup so unreachable network never hangs the app
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timed out')), 3500)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
        return null;
      }

      setProfile(data);
      return data;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      setProfile(null);
      return null;
    }
  }

  useEffect(() => {
    let isMounted = true;

    // Safety timeout: Ensure loading is never permanently stuck at true
    // (e.g. if Supabase project is paused, unreachable, or DNS resolution fails)
    const safetyTimeout = setTimeout(() => {
      if (isMounted) {
        setLoading((prev) => {
          if (prev) {
            console.warn('⚠️ Auth initialization timed out - proceeding in guest mode');
            return false;
          }
          return false;
        });
      }
    }, 2000);

    // 1. Initial session check
    supabase.auth
      .getSession()
      .then(async (response) => {
        if (!isMounted) return;
        const session = response?.data?.session ?? null;
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
      })
      .catch((err) => {
        console.error('Session retrieval error:', err);
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      });

    // 2. Real-time auth state listener
    // Must stay synchronous: awaiting Supabase calls inside this callback deadlocks
    // the auth client, which makes every later getSession() (and API request) hang.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setTimeout(async () => {
        if (!isMounted) return;
        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
        clearTimeout(safetyTimeout);
      }, 0);
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      data?.subscription?.unsubscribe?.();
    };
  }, []);

  // Citizen registration via Backend Admin API to auto-confirm dummy emails!
  async function signUp({ email, password, fullName, phone, ward }) {
    // 1. Call backend admin endpoint that creates user with email_confirm: true
    let res;
    try {
      res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, phone, ward })
      });
    } catch (err) {
      throw new Error('Cannot reach the CivicConnect server. Is the backend running?');
    }

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.error || 'Registration failed');
    }

    // 2. Since the account is automatically confirmed, immediately sign in!
    return await signIn({ email, password });
  }

  // Sign In
  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Cannot reach Supabase from this browser. Check your internet connection or VITE_SUPABASE_URL.');
      }
      throw error;
    }
    let userProfile = null;
    if (data?.user) {
      userProfile = await fetchProfile(data.user.id);
    }
    return { ...data, profile: userProfile };
  }

  // Sign Out
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign out error:', error);
    setUser(null);
    setProfile(null);
  }

  async function refreshProfile() {
    if (user?.id) {
      return await fetchProfile(user.id);
    }
  }

  const value = {
    user,
    profile,
    role: profile?.role || null,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
