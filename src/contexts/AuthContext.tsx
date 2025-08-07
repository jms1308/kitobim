
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
  signIn: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
  
  const signIn = async (phone: string, password: string) => {
      setLoading(true);

      // Create a dummy email from phone for Supabase Auth requirement.
      // This email is NOT stored anywhere.
      const dummyEmail = `${phone}@book-bozori.com`;
      
      const { error } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password: password,
      });

      setLoading(false);

      if (error) {
        return { success: false, error: "Telefon raqam yoki parol xato." };
      }
      return { success: true };
  };

  const signup = async (username: string, phone: string, password: string) => {
    setLoading(true);
    
    // 1. Check if phone number already exists in profiles table
    const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('phone')
        .eq('phone', phone)
        .single();
        
    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
        setLoading(false);
        return { success: false, error: "Tekshirishda xatolik: " + profileError.message };
    }

    if (existingProfile) {
        setLoading(false);
        return { success: false, error: "Bu telefon raqami allaqachon ro'yxatdan o'tgan." };
    }

    // 2. Create a dummy email for Supabase Auth
    // This email is only used for the signUp call and is not stored in the database.
    const dummyEmail = `${phone}@book-bozori.com`;

    // 3. Sign up the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
        email: dummyEmail,
        password: password,
        options: {
            // Pass username and phone to the trigger via metadata
            // This is how we avoid storing email in our profiles table.
            data: {
                username: username,
                phone: phone,
            }
        }
    });

    setLoading(false);

    if (error) {
        if (error.message.includes('User already registered')) {
            return { success: false, error: "Bu telefon raqami allaqachon ro'yxatdan o'tgan." };
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
