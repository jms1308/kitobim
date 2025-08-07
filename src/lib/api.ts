"use client";

import type { Book, User } from './types';
import { supabase } from './supabaseClient';


export const getBooks = async ({
  category,
  city,
  minPrice,
  maxPrice,
  userId,
  searchTerm,
  limit
}: {
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  userId?: string;
  searchTerm?: string;
  limit?: number;
}): Promise<Book[]> => {
    
    let query = supabase.from('books').select(`
        *,
        seller:profiles(username)
    `);

    if (category && category !== 'all') {
        query = query.eq('category', category);
    }
    if (city && city !== 'all') {
        query = query.eq('city', city);
    }
    if (userId) {
        query = query.eq('sellerId', userId);
    }
    if (minPrice !== undefined) {
        query = query.gte('price', minPrice);
    }
    if (maxPrice !== undefined) {
        query = query.lte('price', maxPrice);
    }
    if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`)
    }

    query = query.order('createdAt', { ascending: false });

    if(limit) {
        query = query.limit(limit);
    }

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
        .select(`
            *,
            seller:profiles(username, phone)
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching book by id:', error);
        return null;
    }
     if (!data) return null;

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
        .insert({ ...bookData, createdAt: new Date().toISOString() })
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
    const { data, error } = await supabase
        .from('books')
        .select('category');
    
    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }

    const categories = new Set(data.map(doc => doc.category as string));
    return Array.from(categories);
}

export const getCities = async (): Promise<string[]> => {
     const { data, error } = await supabase
        .from('books')
        .select('city');

    if (error) {
        console.error("Error fetching cities:", error);
        return [];
    }
    const cities = new Set(data.map(doc => doc.city as string));
    return Array.from(cities);
}

export const getUserProfile = async (id: string): Promise<User | null> => {
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return null;
    }
    
    const { count, error: countError } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true })
        .eq('sellerId', id);

    if (countError) {
        console.error('Error fetching posts count:', countError);
    }
    
    if (!profile) return null;

    return {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        phone: profile.phone,
        createdAt: profile.created_at,
        postsCount: count || 0,
    };
}

export const getUserByPhone = async (phone: string): Promise<User | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', phone)
        .single();
    
    if (error || !data) {
        console.error('Error fetching user by phone:', error);
        return null;
    }

    return data as User;
}
