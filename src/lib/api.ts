import type { Book, User } from './types';
import { mockBooks, mockUsers } from './mock-data';

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


export const getBooks = ({
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
}): Book[] => {
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

export const getBookById = (id: string): Book | undefined => {
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

export const addBook = (bookData: Omit<Book, 'id' | 'createdAt' | 'sellerContact'>): Book => {
  const newBook: Book = {
    ...bookData,
    id: `book-${Date.now()}`,
    createdAt: new Date(),
  };
  mockBooks.unshift(newBook);
  return convertBookTimestamps(newBook);
};

export const deleteBook = (id: string, userId: string): { success: boolean } => {
  const bookIndex = mockBooks.findIndex(b => b.id === id && b.sellerId === userId);
  if (bookIndex > -1) {
    mockBooks.splice(bookIndex, 1);
    return { success: true };
  }
  return { success: false };
};

export const getCategories = (): string[] => {
    const categories = new Set(mockBooks.map(doc => doc.category as string));
    return Array.from(categories);
}

export const getCities = (): string[] => {
    const cities = new Set(mockBooks.map(doc => doc.city as string));
    return Array.from(cities);
}

export const getUserById = (id: string): User | null => {
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
