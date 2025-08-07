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
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      const recentBooks = await getBooks({ limit: 8 });
      setBooks(recentBooks);
      setIsLoading(false);
    };
    fetchBooks();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      const filtered = await getBooks({ searchTerm: searchQuery, limit: 8 });
      setBooks(filtered);
      setIsLoading(false);
  }

  return (
    <div className="space-y-12">
      <section className="text-center bg-card p-8 md:p-16 rounded-2xl shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">
          Kitob Bozori
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          O'zingiz uchun yangi sarguzashtlarni kashf eting yoki eski kitoblaringizga yangi hayot baxsh eting.
        </p>
        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
          <Input
            type="search"
            placeholder="Sarlavha yoki muallif bo'yicha qidirish..."
            className="text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" size="lg" className="transition-transform hover:scale-105" disabled={isLoading}>
            <Search className="h-5 w-5 mr-2" />
            {isLoading ? 'Qidirilmoqda...' : 'Qidirish'}
          </Button>
        </form>
      </section>

      <section>
        <h2 className="text-3xl font-bold font-headline mb-6">So'nggi E'lonlar</h2>
        {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map((book) => <BookCard key={book.id} book={book} />)}
            </div>
        )}
      </section>
    </div>
  );
}
