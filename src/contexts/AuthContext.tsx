
"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import type { User as AppUser } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { getUserById } from '@/lib/api';
import { mockUsers } from '@/lib/mock-data';


interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (username: string, email: string, pass: string) => Promise<{ success: boolean; errorCode?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check local storage for a logged-in user
    const checkUser = async () => {
      try {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
          const appUser = await getUserById(storedUserId);
          setUser(appUser);
        }
      } catch (e) {
        console.error("Error fetching user from mock API", e);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Find user in mock data
      const mockUser = mockUsers.find(u => u.email === email);
      if (mockUser) { // In a real app, you'd check the password hash
        const appUser = await getUserById(mockUser.id);
        setUser(appUser);
        localStorage.setItem('userId', mockUser.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      setUser(null);
      return false;
    } finally {
        setLoading(false);
    }
  };

  const signup = async (username: string, email: string, pass: string): Promise<{ success: boolean; errorCode?: string }> => {
    setLoading(true);
    try {
      // Check if user exists
      if (mockUsers.some(u => u.email === email)) {
        return { success: false, errorCode: 'auth/email-already-in-use' };
      }
      
      const newUser: AppUser = {
        id: `user-${Date.now()}`,
        username,
        email,
        createdAt: new Date(),
        postsCount: 0,
      };

      // Add to mock data (in real app, this would be a DB call)
      // We don't store passwords in this example.
      mockUsers.push({ ...newUser, passwordHash: '...' });

      setUser(newUser);
      localStorage.setItem('userId', newUser.id);
      
      return { success: true };
    } catch (error: any) {
      console.error("Signup error:", error);
      return { success: false, errorCode: error.code };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
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
