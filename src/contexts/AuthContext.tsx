"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (username: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('kitob_bozori_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('kitob_bozori_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    // This is mock logic. In a real app, you'd call your backend.
    if (email === 'kitobxon@example.com' && pass === 'password') {
      const loggedInUser: User = {
        id: 'user-1',
        username: 'Kitobxon',
        email: 'kitobxon@example.com',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('kitob_bozori_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return true;
    }
    return false;
  };

  const signup = async (username: string, email: string, pass: string): Promise<boolean> => {
     // Mock logic
    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      email,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('kitob_bozori_user', JSON.stringify(newUser));
    setUser(newUser);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('kitob_bozori_user');
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    isAuthenticated: !!user,
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
