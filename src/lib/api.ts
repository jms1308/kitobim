
"use client";

import type { Book, User } from './types';
import { supabase } from './supabaseClient';

// --- User Functions (No Auth) ---

export const createUser = async (username: string, phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Check if phone number already exists
    const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('phone')
        .eq('phone', phone)
        .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 means no rows found, which is good
        console.error('Error checking for existing user:', selectError);
        return { success: false, error: "Foydalanuvchini tekshirishda xatolik." };
    }

    if (existingUser) {
        return { success: false, error: "Bu telefon raqami allaqachon ro'yxatdan o'tgan." };
    }

    // Create new user
    const { error: insertError } = await supabase
        .from('users')
        .insert({ username, phone, password });

    if (insertError) {
        console.error('Error creating user:', insertError);
        return { success: false, error: "Foydalanuvchi yaratishda xatolik yuz berdi." };
    }

    return { success: true };
};

export const loginUser = async (phone: string, password: string): Promise<User | null> => {
    const { data, error } = await supabase
        .from('users')
        .select('id, username, phone, createdAt')
        .eq('phone', phone)
        .eq('password', password) // WARNING: Insecure
        .single();
    
    if (error || !data) {
        console.error("Login failed:", error);
        return null;
    }
    
    const postsCount = await getPostsCountForUser(data.id);

    return { ...data, postsCount };
};

export const getUserProfile = async (id: string): Promise<User | null> => {
    const { data, error } = await supabase
        .from('users')
        .select('id, username, phone, createdAt')
        .eq('id', id)
        .single();

    if (error || !data) {
        console.error('Error fetching user profile:', error);
        return null;
    }
    
    const postsCount = await getPostsCountForUser(data.id);
    
    return { ...data, postsCount };
};

const getPostsCountForUser = async (userId: string): Promise<number> => {
     const { count, error } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true })
        .eq('sellerId', userId);
    
    if(error) {
        console.error('Error fetching posts count:', error);
        return 0;
    }
    return count || 0;
}


// --- Book Functions ---

export const getBooks = async ({
  category,
  city,
  userId,
  searchTerm,
  limit
}: {
  category?: string;
  city?: string;
  userId?: string;
  searchTerm?: string;
  limit?: number;
}): Promise<Book[]> => {
    
    let query = supabase.from('books').select(`
        *,
        seller:users(username, phone)
    `);

    if (category && category !== 'all') query = query.eq('category', category);
    if (city && city !== 'all') query = query.eq('city', city);
    if (userId) query = query.eq('sellerId', userId);
    if (searchTerm) query = query.or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`);

    query = query.order('createdAt', { ascending: false });

    if(limit) query = query.limit(limit);

    const { data, error } = await query;
    
    if (error) {
        console.error('Error fetching books:', error);
        return [];
    }

    return data.map(item => ({
        ...item,
        sellerContact: {
            name: (item.seller as any)?.username || 'Noma\'lum',
            phone: (item.seller as any)?.phone || 'Noma\'lum'
        }
    })) as Book[];
};

export const getBookById = async (id: string): Promise<Book | null> => {
    const { data, error } = await supabase
        .from('books')
        .select(`*, seller:users(username, phone)`)
        .eq('id', id)
        .single();

    if (error || !data) {
        console.error('Error fetching book by id:', error);
        return null;
    }

    return {
        ...data,
        sellerContact: {
            name: (data.seller as any)?.username || 'Noma\'lum',
            phone: (data.seller as any)?.phone || 'Noma\'lum'
        }
    } as Book;
};

export const addBook = async (bookData: Omit<Book, 'id' | 'createdAt' | 'sellerContact'>): Promise<Book | null> => {
    const { data, error } = await supabase
        .from('books')
        .insert({ ...bookData })
        .select()
        .single();
    
    if(error) {
        console.error("Error adding book:", error);
        return null;
    }
    
    return data as Book;
};

export const deleteBook = async (id: string, userId: string): Promise<{ success: boolean }> => {
    const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id)
        .eq('sellerId', userId);

    if (error) {
        console.error("Error deleting book:", error);
        return { success: false };
    }
    return { success: true };
};

export const getCategories = async (): Promise<string[]> => {
    const { data, error } = await supabase.from('books').select('category');
    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
    const categories = new Set(data.map(doc => doc.category as string));
    return Array.from(categories);
}

export const getCities = async (): Promise<string[]> => {
     const { data, error } = await supabase.from('books').select('city');
    if (error) {
        console.error("Error fetching cities:", error);
        return [];
    }
    const cities = new Set(data.map(doc => doc.city as string));
    return Array.from(cities);
}
