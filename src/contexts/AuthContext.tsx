
"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import type { User as AppUser } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getUserProfile, getUserByPhone } from '@/lib/api';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';


interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (emailOrPhone: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, email: string, pass: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
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

  const login = async (emailOrPhone: string, pass: string) => {
    setLoading(true);

    let loginEmail = emailOrPhone;
    
    // Check if the input is a phone number
    if (!emailOrPhone.includes('@')) {
        const userProfile = await getUserByPhone(emailOrPhone);
        if (userProfile && userProfile.email) {
            loginEmail = userProfile.email;
        } else {
            setLoading(false);
            return { success: false, error: "Bunday telefon raqamiga ega foydalanuvchi topilmadi." };
        }
    }

    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: pass });
    setLoading(false);
    
    if (error) {
        return { success: false, error: "Email yoki parol noto'g'ri." };
    }
    return { success: true };
  };

  const signup = async (username: string, email: string, pass: string, phone?: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
            data: {
                username: username,
                phone: phone,
            }
        }
    });

    setLoading(false);

    if (error) {
        if (error.message.includes('User already registered')) {
            return { success: false, error: "Bu email manzili allaqachon ro'yxatdan o'tgan." };
        }
        return { success: false, error: error.message };
    }
    
    if (data.user) {
         // The trigger will create the profile, let's just log in the user
        const loginData = await login(email, pass);
        return loginData;
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
