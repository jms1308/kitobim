
export type Condition = 'yangi' | 'yaxshi' | 'yomon';

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  condition: Condition;
  category: string;
  city: string;
  imageUrl: string;
  createdAt: string;
  sellerId: string; // This will now be the user's ID from our custom table
  sellerContact?: {
    name: string;
    phone: string;
  };
}

export interface User {
  id: string;
  username: string;
  phone: string;
  createdAt: string;
  postsCount: number;
}
