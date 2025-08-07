import { Timestamp } from "firebase/firestore";

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
  createdAt: string | Timestamp;
  sellerId: string;
  sellerContact?: {
    name: string;
    phone: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string | Timestamp;
}
