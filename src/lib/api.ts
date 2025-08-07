import { mockBooks, mockUsers } from './mock-data';
import type { Book, User } from './types';

const API_DELAY = 500;

let books: Book[] = [...mockBooks];
let users: (User & { passwordHash: string })[] = [...mockUsers];

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getBooks = async ({
  category,
  city,
  minPrice,
  maxPrice,
  userId,
}: {
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  userId?: string;
}): Promise<Book[]> => {
  await delay(API_DELAY);
  let filteredBooks = [...books];

  if (category) {
    filteredBooks = filteredBooks.filter(book => book.category === category);
  }
  if (city) {
    filteredBooks = filteredBooks.filter(book => book.city === city);
  }
  if (minPrice !== undefined) {
    filteredBooks = filteredBooks.filter(book => book.price >= minPrice);
  }
  if (maxPrice !== undefined) {
    filteredBooks = filteredBooks.filter(book => book.price <= maxPrice);
  }
  if (userId) {
    filteredBooks = filteredBooks.filter(book => book.sellerId === userId);
  }

  return JSON.parse(JSON.stringify(filteredBooks));
};

export const getBookById = async (id: string): Promise<Book | undefined> => {
  await delay(API_DELAY);
  const book = books.find(book => book.id === id);
  if(!book) return undefined;
  
  const seller = users.find(user => user.id === book.sellerId);
  return JSON.parse(JSON.stringify({
    ...book,
    sellerContact: {
        name: seller?.username || 'Noma\'lum',
        phone: '+998 XX XXX XX XX' // Don't expose real phone number
    }
  }));
};

export const addBook = async (bookData: Omit<Book, 'id' | 'createdAt'>): Promise<Book> => {
  await delay(API_DELAY);
  const newBook: Book = {
    ...bookData,
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
  };
  books.unshift(newBook);
  return JSON.parse(JSON.stringify(newBook));
};

export const deleteBook = async (id: string, userId: string): Promise<{ success: boolean }> => {
  await delay(API_DELAY);
  const bookIndex = books.findIndex(book => book.id === id && book.sellerId === userId);
  if (bookIndex > -1) {
    books.splice(bookIndex, 1);
    return { success: true };
  }
  return { success: false };
};

export const getCategories = async (): Promise<string[]> => {
    await delay(100);
    const categories = new Set(books.map(b => b.category));
    return Array.from(categories);
}

export const getCities = async (): Promise<string[]> => {
    await delay(100);
    const cities = new Set(books.map(b => b.city));
    return Array.from(cities);
}
