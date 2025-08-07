
"use client";

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { getUserProfile, loginUser, createUser } from '@/lib/api';

const avatarStyles = [
  "adventurer", "adventurer-neutral", "avataaars", "big-ears", 
  "big-ears-neutral", "big-smile", "bottts", "croodles", "fun-emoji",
  "icons", "identicon", "initials", "lorelei", "micah", "miniavs",
  "open-peeps", "personas", "pixel-art", "pixel-art-neutral", "rings"
];

const getRandomAvatarUrl = (seed: string) => {
  const style = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&radius=50`;
}


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
  const [loading, setLoading] = useState(true); // Only true on initial load
  const router = useRouter();

  const handleSetUser = useCallback((userData: Omit<User, 'avatarUrl'> | null) => {
    if (userData) {
      const avatarUrl = getRandomAvatarUrl(userData.id);
      setUser({ ...userData, avatarUrl });
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // This effect runs only once on initial mount to check for a logged-in user.
    const checkUserOnLoad = async () => {
      setLoading(true);
      try {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
          const profile = await getUserProfile(storedUserId);
          if (profile) {
            handleSetUser(profile);
          } else {
             localStorage.removeItem('userId');
             handleSetUser(null);
          }
        } else {
          handleSetUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user on initial load:", error);
        handleSetUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUserOnLoad();
  }, [handleSetUser]);
  
  const signup = async (username: string, phone: string, password: string) => {
    const { data, success, error } = await createUser(username, phone, password);
    if (success && data) {
      handleSetUser(data);
      localStorage.setItem('userId', data.id);
      return { success: true };
    }
    return { success: false, error };
  };

  const login = async (phone: string, password: string) => {
      const loggedInUser = await loginUser(phone, password);
      if (loggedInUser) {
        handleSetUser(loggedInUser);
        localStorage.setItem('userId', loggedInUser.id);
        return { success: true };
      }
      return { success: false, error: "Telefon raqami yoki parol xato." };
  };

  const logout = () => {
    handleSetUser(null);
    localStorage.removeItem('userId');
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
