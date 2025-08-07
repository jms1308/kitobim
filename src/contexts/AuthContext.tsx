

"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { getUserProfile, loginUser, createUser } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for user in localStorage on initial load
    const checkUser = async () => {
      try {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
          const profile = await getUserProfile(storedUserId);
          if (profile) {
            setUser(profile);
          } else {
             // Clear local storage if user not found in DB
             localStorage.removeItem('userId');
          }
        }
      } catch (error) {
        console.error("Failed to fetch user from localStorage:", error);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);
  
  const signup = async (username: string, phone: string, password: string) => {
    const { success, error } = await createUser(username, phone, password);
    if (success) {
      // Automatically log in after successful signup
      const loggedInUser = await loginUser(phone, password);
      if(loggedInUser) {
        setUser(loggedInUser);
        localStorage.setItem('userId', loggedInUser.id);
        return { success: true };
      }
      return { success: false, error: "Ro'yxatdan o'tdingiz, ammo avtomatik kirishda xatolik." };
    }
    return { success: false, error };
  };

  const login = async (phone: string, password: string) => {
      const loggedInUser = await loginUser(phone, password);
      if (loggedInUser) {
        setUser(loggedInUser);
        localStorage.setItem('userId', loggedInUser.id);
        return { success: true };
      }
      return { success: false, error: "Telefon raqami yoki parol xato." };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
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
