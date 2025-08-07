"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import type { User as AppUser } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getUserProfile, getUserByPhone } from '@/lib/api';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  signInWithOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, token: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, phone: string) => Promise<{ success: boolean; error?: string }>;
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

  const signInWithOtp = async (phone: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);

    if (error) {
      if (error.message.includes('User not found')) {
        return { success: false, error: "Bu raqam ro'yxatdan o'tmagan." };
      }
      return { success: false, error: "Kod yuborishda xatolik: " + error.message };
    }
    return { success: true };
  };
  
  const verifyOtp = async (phone: string, token: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    setLoading(false);

    if (error) {
        return { success: false, error: "Kod noto'g'ri yoki muddati o'tgan." };
    }
    return { success: true };
  };

  const signup = async (username: string, phone: string) => {
    setLoading(true);
    // Dummy email and password, as they are required but we won't use them.
    const dummyEmail = `${phone}@book-bozori.com`;
    const dummyPassword = Math.random().toString(36).slice(-8);

    const { data, error } = await supabase.auth.signUp({
        email: dummyEmail, // Supabase requires email for phone auth signup flow
        password: dummyPassword, 
        phone: phone,
        options: {
            data: {
                username: username,
                phone: phone,
            }
        }
    });

    setLoading(false);

    if (error) {
        if (error.message.includes('User already registered') || error.message.includes('unique constraint')) {
            return { success: false, error: "Bu telefon raqami yoki foydalanuvchi nomi allaqachon ro'yxatdan o'tgan." };
        }
        return { success: false, error: error.message };
    }
    
    // We don't log in automatically. User must verify OTP via login page after signup.
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
    signInWithOtp,
    verifyOtp,
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
