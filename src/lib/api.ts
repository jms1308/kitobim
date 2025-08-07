import { db, auth } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, deleteDoc, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Book, User } from './types';

const API_DELAY = 0; // No more mock delay needed

const booksCollection = collection(db, 'books');
const usersCollection = collection(db, 'users');

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Helper to convert Firestore Timestamp to string
const convertBookTimestamps = (book: Book): Book => {
    if (book.createdAt instanceof Timestamp) {
        return { ...book, createdAt: book.createdAt.toDate().toISOString() };
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
  
  let q = query(booksCollection, orderBy('createdAt', 'desc'));
  
  if (category && category !== 'all') {
    q = query(q, where('category', '==', category));
  }
  if (city && city !== 'all') {
    q = query(q, where('city', '==', city));
  }
  if (userId) {
    q = query(q, where('sellerId', '==', userId));
  }

  const querySnapshot = await getDocs(q);
  let booksData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Book));

  if (minPrice !== undefined) {
    booksData = booksData.filter(book => book.price >= minPrice);
  }
  if (maxPrice !== undefined) {
    booksData = booksData.filter(book => book.price <= maxPrice);
  }

  return booksData.map(convertBookTimestamps);
};

export const getBookById = async (id: string): Promise<Book | undefined> => {
  await delay(API_DELAY);
  const bookDocRef = doc(db, 'books', id);
  const bookSnap = await getDoc(bookDocRef);

  if (!bookSnap.exists()) {
    return undefined;
  }
  
  let bookData = { ...bookSnap.data(), id: bookSnap.id } as Book;

  if (bookData.sellerId) {
    const sellerDocRef = doc(db, 'users', bookData.sellerId);
    const sellerSnap = await getDoc(sellerDocRef);

    if (sellerSnap.exists()) {
       const sellerData = sellerSnap.data() as User;
       bookData.sellerContact = {
           name: sellerData.username,
           phone: '+998 XX XXX XX XX' // Keep phone number private
       };
    } else {
       bookData.sellerContact = {
           name: 'Noma\'lum',
           phone: '+998 XX XXX XX XX'
       };
    }
  }
  
  return convertBookTimestamps(bookData);
};

export const addBook = async (bookData: Omit<Book, 'id' | 'createdAt' | 'sellerContact'>): Promise<Book> => {
  await delay(API_DELAY);
  
  const docRef = await addDoc(booksCollection, {
      ...bookData,
      createdAt: serverTimestamp(),
  });

  const newBookSnap = await getDoc(docRef);
  const newBook = { ...newBookSnap.data(), id: newBookSnap.id } as Book;
  
  return convertBookTimestamps(newBook);
};

export const deleteBook = async (id: string, userId: string): Promise<{ success: boolean }> => {
  await delay(API_DELAY);
  const bookDocRef = doc(db, 'books', id);
  const bookSnap = await getDoc(bookDocRef);

  if (bookSnap.exists() && bookSnap.data().sellerId === userId) {
    await deleteDoc(bookDocRef);
    return { success: true };
  }
  
  return { success: false };
};

export const getCategories = async (): Promise<string[]> => {
    await delay(API_DELAY);
    const querySnapshot = await getDocs(booksCollection);
    const categories = new Set(querySnapshot.docs.map(doc => doc.data().category as string));
    return Array.from(categories);
}

export const getCities = async (): Promise<string[]> => {
    await delay(API_DELAY);
    const querySnapshot = await getDocs(booksCollection);
    const cities = new Set(querySnapshot.docs.map(doc => doc.data().city as string));
    return Array.from(cities);
}

export const getUserById = async (id: string): Promise<User | null> => {
    const userDocRef = doc(db, 'users', id);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
        const userData = userSnap.data();
        const createdAt = userData.createdAt as Timestamp | null;
        return {
            id: userSnap.id,
            username: userData.username,
            email: userData.email,
            createdAt: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString()
        };
    }
    return null;
}
