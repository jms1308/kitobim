"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import BookCard from '@/components/BookCard';
import { getBooks } from '@/lib/api';
import type { Book } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      const allBooks = await getBooks({});
      setBooks(allBooks);
      setLoading(false);
    };
    fetchBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    const getBookDate = (book: Book) => {
        if (typeof book.createdAt === 'string') {
            return new Date(book.createdAt);
        }
        return book.createdAt;
    }
    const recentBooks = [...books].sort((a, b) => getBookDate(b).getTime() - getBookDate(a).getTime());
    
    if (!searchQuery) {
      return recentBooks.slice(0, 8);
    }
    return recentBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8);
  }, [books, searchQuery]);

  return (
    <div className="space-y-12">
      <section className="text-center bg-card p-8 md:p-16 rounded-2xl shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">
          Kitob Bozori
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          O'zingiz uchun yangi sarguzashtlarni kashf eting yoki eski kitoblaringizga yangi hayot baxsh eting.
        </p>
        <div className="max-w-xl mx-auto flex gap-2">
          <Input
            type="search"
            placeholder="Sarlavha yoki muallif bo'yicha qidirish..."
            className="text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button size="lg" className="transition-transform hover:scale-105">
            <Search className="h-5 w-5 mr-2" />
            Qidirish
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold font-headline mb-6">So'nggi E'lonlar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            : filteredBooks.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      </section>
    </div>
  );
}
