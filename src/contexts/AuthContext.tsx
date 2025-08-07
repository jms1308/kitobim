
"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import type { User as AppUser } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getUserProfile } from '@/lib/api';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';


interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setLoading(true);
        if (session && session.user) {
          const profile = await getUserProfile(session.user.id);
          setUser(profile);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );
    
    // Initial check
    const checkInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
         if (session && session.user) {
          const profile = await getUserProfile(session.user.id);
          setUser(profile);
        }
        setLoading(false);
    }
    checkInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    
    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true };
  };

  const signup = async (username: string, email: string, pass: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
            data: {
                username: username,
            }
        }
    });

    setLoading(false);

    if (error) {
        return { success: false, error: error.message };
    }
    // Supabase sends a confirmation email, user needs to verify.
    // The onAuthStateChange listener will handle setting the user session after verification.
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    isAuthenticated: !loading && !!user,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
