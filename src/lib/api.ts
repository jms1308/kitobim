import type { Book, User } from './types';
import { mockBooks, mockUsers } from './mock-data';

// Simulating API delay
const API_DELAY = 0;
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const convertBookTimestamps = (book: Book): Book => {
    if (book.createdAt instanceof Date) {
        return { ...book, createdAt: book.createdAt.toISOString() };
    }
     if (typeof book.createdAt !== 'string') {
        // Fallback for any other type
        return { ...book, createdAt: new Date().toISOString() };
    }
    return book;
};


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
  
  let books = mockBooks;

  if (category && category !== 'all') {
    books = books.filter(book => book.category === category);
  }
  if (city && city !== 'all') {
    books = books.filter(book => book.city === city);
  }
  if (userId) {
    books = books.filter(book => book.sellerId === userId);
  }
  if (minPrice !== undefined) {
    books = books.filter(book => book.price >= minPrice);
  }
  if (maxPrice !== undefined) {
    books = books.filter(book => book.price <= maxPrice);
  }

  return books.map(convertBookTimestamps);
};

export const getBookById = async (id: string): Promise<Book | undefined> => {
  await delay(API_DELAY);
  const book = mockBooks.find(b => b.id === id);
  if (book) {
     const seller = mockUsers.find(u => u.id === book.sellerId);
     if(seller) {
        book.sellerContact = { name: seller.username, phone: '+998 XX XXX XX XX' };
     }
     return convertBookTimestamps(book);
  }
  return undefined;
};

export const addBook = async (bookData: Omit<Book, 'id' | 'createdAt' | 'sellerContact'>): Promise<Book> => {
  await delay(API_DELAY);
  const newBook: Book = {
    ...bookData,
    id: `book-${Date.now()}`,
    createdAt: new Date(),
  };
  mockBooks.unshift(newBook);
  return convertBookTimestamps(newBook);
};

export const deleteBook = async (id: string, userId: string): Promise<{ success: boolean }> => {
  await delay(API_DELAY);
  const bookIndex = mockBooks.findIndex(b => b.id === id && b.sellerId === userId);
  if (bookIndex > -1) {
    mockBooks.splice(bookIndex, 1);
    return { success: true };
  }
  return { success: false };
};

export const getCategories = async (): Promise<string[]> => {
    await delay(API_DELAY);
    const categories = new Set(mockBooks.map(doc => doc.category as string));
    return Array.from(categories);
}

export const getCities = async (): Promise<string[]> => {
    await delay(API_DELAY);
    const cities = new Set(mockBooks.map(doc => doc.city as string));
    return Array.from(cities);
}

export const getUserById = async (id: string): Promise<User | null> => {
    await delay(API_DELAY);
    const user = mockUsers.find(u => u.id === id);
    if(user) {
        const postsCount = mockBooks.filter(b => b.sellerId === id).length;
        const { passwordHash, ...userWithoutPassword } = user;
        
        let createdAtString: string;
        if (user.createdAt instanceof Date) {
            createdAtString = user.createdAt.toISOString();
        } else if (typeof user.createdAt === 'string') {
            createdAtString = user.createdAt;
        }
        else {
            createdAtString = new Date().toISOString();
        }

        return {
            ...userWithoutPassword,
            createdAt: createdAtString,
            postsCount,
        }
    }
    return null;
}
