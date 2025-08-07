"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import type { AppUser } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getUserById } from '@/lib/api';


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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const appUser = await getUserById(firebaseUser.uid);
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const appUser = await getUserById(userCredential.user.uid);
      setUser(appUser);
      return true;
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      const newUser: Omit<AppUser, 'id'> = {
        username,
        email,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "users", firebaseUser.uid), {
          ...newUser,
          createdAt: serverTimestamp()
      });

      return { success: true };
    } catch (error: any) {
      console.error("Signup error:", error);
      return { success: false, errorCode: error.code };
    } finally {
        setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
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
