

"use client";

import type { Book, User } from './types';
import { supabase } from './supabaseClient';


// Helper function to normalize phone numbers to the last 9 digits
const normalizePhone = (phone: string) => {
    return phone.replace(/[^0-9]/g, '').slice(-9);
};


// --- User Functions (No Auth) ---

export const createUser = async (username: string, phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length !== 9) {
        return { success: false, error: "Telefon raqami noto'g'ri formatda." };
    }

    // Check if phone number already exists by comparing the last 9 digits
    const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('phone')
        .like('phone', `%${normalizedPhone}`);

    if (selectError) {
        console.error('Error checking for existing user:', selectError);
        return { success: false, error: "Foydalanuvchini tekshirishda xatolik." };
    }

    if (existingUser && existingUser.length > 0) {
        return { success: false, error: "Bu telefon raqami allaqachon ro'yxatdan o'tgan." };
    }

    // Create new user with the normalized phone number
    const { error: insertError } = await supabase
        .from('users')
        .insert({ username, phone: normalizedPhone, password });

    if (insertError) {
        console.error('Error creating user:', insertError);
        return { success: false, error: "Foydalanuvchi yaratishda xatolik yuz berdi." };
    }

    return { success: true };
};

export const loginUser = async (phone: string, password: string): Promise<User | null> => {
    const normalizedPhone = normalizePhone(phone);

    const { data, error } = await supabase
        .from('users')
        .select('id, username, phone, createdAt')
        .eq('phone', normalizedPhone)
        .eq('password', password)
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
        seller:users(id, username, phone)
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
        .select(`*, seller:users(id, username, phone)`)
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
    const { sellerId, title, author, description, price, condition, category, city, imageUrl } = bookData;

    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username, phone')
        .eq('id', sellerId)
        .single();

    if (userError || !userData) {
        console.error('Error fetching seller for contact info:', userError);
        return null;
    }

    const bookToInsert = {
        title,
        author,
        description,
        price,
        condition,
        category,
        city,
        imageUrl,
        sellerId
    };

    const { data, error } = await supabase
        .from('books')
        .insert(bookToInsert)
        .select()
        .single();
    
    if(error) {
        console.error("Error adding book:", error);
        return null;
    }
    
    return {
        ...data,
        sellerContact: {
            name: userData.username,
            phone: userData.phone
        }
    } as Book;
};


export const deleteBook = async (id: string, userId: string): Promise<{ success: boolean }> => {
    // We don't need to check the seller since RLS from supabase will handle it.
    const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

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
