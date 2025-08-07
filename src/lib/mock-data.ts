import type { Book, User } from './types';
import { Timestamp } from 'firebase/firestore';

// Note: This data is now only for reference and seeding, not used directly by the app.
// The app connects to Firebase.

export const mockUsers: (User & { passwordHash: string })[] = [
  {
    id: 'user-1',
    username: 'Kitobxon',
    email: 'kitobxon@example.com',
    passwordHash: 'hashed_password_123',
    createdAt: Timestamp.fromDate(new Date()),
  },
];

export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'O\'tkan kunlar',
    author: 'Abdulla Qodiriy',
    description: 'O\'zbek adabiyotining durdona asari. O\'tgan asr voqealari haqida hikoya qiladi.',
    price: 50000,
    condition: 'yaxshi',
    category: 'Badiiy adabiyot',
    city: 'Toshkent',
    imageUrl: 'https://placehold.co/600x800.png',
    createdAt: Timestamp.fromDate(new Date('2024-05-19T10:00:00Z')),
    sellerId: 'user-1',
    sellerContact: { name: 'Alisher', phone: '+998901234567' }
  },
  {
    id: '2',
    title: 'Ufq romani',
    author: 'Said Ahmad',
    description: 'Ikkinchi jahon urushi davridagi o\'zbek xalqining matonati haqidagi roman.',
    price: 45000,
    condition: 'yangi',
    category: 'Tarixiy roman',
    city: 'Samarqand',
    imageUrl: 'https://placehold.co/600x800.png',
    createdAt: Timestamp.fromDate(new Date('2024-05-20T12:30:00Z')),
    sellerId: 'user-2',
    sellerContact: { name: 'Nodira', phone: '+998912345678' }
  },
  {
    id: '3',
    title: 'Yulduzli tunlar',
    author: 'Pirimqul Qodirov',
    description: 'Bobur hayotiga bag\'ishlangan tarixiy roman.',
    price: 55000,
    condition: 'yomon',
    category: 'Tarixiy roman',
    city: 'Buxoro',
    imageUrl: 'https://placehold.co/600x800.png',
    createdAt: Timestamp.fromDate(new Date('2024-05-18T09:00:00Z')),
    sellerId: 'user-1',
    sellerContact: { name: 'Alisher', phone: '+998901234567' }
  },
  {
    id: '4',
    title: 'Shum Bola',
    author: 'G\'afur G\'ulom',
    description: 'Sho\'x bola sarguzashtlari haqida qiziqarli qissa.',
    price: 30000,
    condition: 'yaxshi',
    category: 'Bolalar adabiyoti',
    city: 'Farg\'ona',
    imageUrl: 'https://placehold.co/600x800.png',
    createdAt: Timestamp.fromDate(new Date('2024-05-21T15:00:00Z')),
    sellerId: 'user-3',
    sellerContact: { name: 'Sanjar', phone: '+998934567890' }
  },
    {
    id: '5',
    title: 'Sariq devni minib',
    author: 'Xudoyberdi To\'xtaboyev',
    description: 'Sehrli sarguzashtlar haqida ajoyib ertak-qissa.',
    price: 35000,
    condition: 'yangi',
    category: 'Bolalar adabiyoti',
    city: 'Andijon',
    imageUrl: 'https://placehold.co/600x800.png',
    createdAt: Timestamp.fromDate(new Date('2024-05-22T11:00:00Z')),
    sellerId: 'user-2',
    sellerContact: { name: 'Nodira', phone: '+998912345678' }
  },
  {
    id: '6',
    title: 'Kecha va Kunduz',
    author: 'Cho\'lpon',
    description: 'Jadidchilik davri haqidagi mashhur roman.',
    price: 60000,
    condition: 'yaxshi',
    category: 'Badiiy adabiyot',
    city: 'Toshkent',
    imageUrl: 'https://placehold.co/600x800.png',
    createdAt: Timestamp.fromDate(new Date('2024-05-21T18:00:00Z')),
    sellerId: 'user-1',
    sellerContact: { name: 'Alisher', phone: '+998901234567' }
  },
  {
    id: '7',
    title: 'Mehrobdan Chayon',
    author: 'Abdulla Qodiriy',
    description: 'Anvar va Ra\'noning sevgi qissasi.',
    price: 52000,
    condition: 'yaxshi',
    category: 'Badiiy adabiyot',
    city: 'Qo\'qon',
    imageUrl: 'https://placehold.co/600x800.png',
    createdAt: Timestamp.fromDate(new Date('2024-05-22T14:20:00Z')),
    sellerId: 'user-4',
    sellerContact: { name: 'Madina', phone: '+998945678901' }
  },
  {
    id: '8',
    title: 'Dunyoning ishlari',
    author: 'O\'tkir Hoshimov',
    description: 'Ona haqidagi ta\'sirli hikoyalar to\'plami.',
    price: 40000,
    condition: 'yangi',
    category: 'Hikoyalar',
    city: 'Namangan',
    imageUrl: 'https://placehold.co/600x800.png',
    createdAt: Timestamp.fromDate(new Date('2024-05-23T08:45:00Z')),
    sellerId: 'user-3',
    sellerContact: { name: 'Sanjar', phone: '+998934567890' }
  }
];
