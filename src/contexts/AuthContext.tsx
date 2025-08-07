
"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import type { User as AppUser } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getUserProfile } from '@/lib/api';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, phone: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleAuthChange = async (event: AuthChangeEvent, session: Session | null) => {
    setLoading(true);
    if (session && session.user) {
      const profile = await getUserProfile(session.user.id);
      setUser(profile);
    } else {
      setUser(null);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthChange);
    
    const checkInitialSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        const profile = await getUserProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkInitialSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const signIn = async (email: string, password: string) => {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      setLoading(false);

      if (error) {
        return { success: false, error: "Email yoki parol xato." };
      }
      return { success: true };
  };

  const signup = async (username: string, phone: string, email: string, password: string) => {
    setLoading(true);
    
    // 1. Check if phone number or email already exists
    const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('phone, email')
        .or(`phone.eq.${phone},email.eq.${email}`)
        .single();
        
    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
        setLoading(false);
        return { success: false, error: "Tekshirishda xatolik: " + profileError.message };
    }

    if (existingProfile) {
        setLoading(false);
        let errorMessage = '';
        if (existingProfile.phone === phone) {
            errorMessage = "Bu telefon raqami allaqachon ro'yxatdan o'tgan.";
        } else if (existingProfile.email === email) {
            errorMessage = "Bu email allaqachon ro'yxatdan o'tgan.";
        }
        return { success: false, error: errorMessage };
    }


    // 2. Sign up the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                username: username,
                phone: phone,
                email: email
            }
        }
    });

    setLoading(false);

    if (error) {
        if (error.message.includes('User already registered')) {
            return { success: false, error: "Bu email allaqachon ro'yxatdan o'tgan." };
        }
        return { success: false, error: error.message };
    }
    
    if (!data.user) {
        return { success: false, error: "Foydalanuvchi yaratilmadi, iltimos qayta urinib ko'ring." };
    }

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
    signIn,
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
