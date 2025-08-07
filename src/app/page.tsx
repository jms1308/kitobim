
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
  const [isSearched, setIsSearched] = useState(false);
  
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
      setIsSearched(true);
      const filtered = await getBooks({ searchTerm: searchQuery });
      setBooks(filtered);
      setIsLoading(false);
  }

  const resultTitle = useMemo(() => {
    if (!isSearched) {
      return "So'nggi E'lonlar";
    }
    return `Qidiruv natijalari: ${books.length} ta kitob topildi`;
  }, [isSearched, books.length]);

  return (
    <div className="space-y-12">
      <section className="text-center bg-card p-8 md:p-16 rounded-2xl shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">
          Kitoblaringizni soting
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          O'zingiz uchun yangi sarguzashtlarni kashf eting yoki eski kitoblaringizga yangi hayot baxsh eting.
        </p>
         <form onSubmit={handleSearch} className="max-w-xl mx-auto w-full flex gap-2">
          <Input
            type="search"
            placeholder="Sarlavha yoki muallif bo'yicha qidirish..."
            className="text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" size="icon" className="md:hidden transition-transform hover:scale-105" disabled={isLoading}>
            <Search className="h-5 w-5" />
             <span className="sr-only">Qidirish</span>
          </Button>
          <Button type="submit" size="lg" className="hidden md:flex transition-transform hover:scale-105" disabled={isLoading}>
            <Search className="h-5 w-5 mr-2" />
            {isLoading ? 'Qidirilmoqda...' : 'Qidirish'}
          </Button>
        </form>
      </section>

      <section>
        <h2 className="text-3xl font-bold font-headline mb-6">{resultTitle}</h2>
        {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
            </div>
        ) : (
            books.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {books.map((book) => <BookCard key={book.id} book={book} />)}
                </div>
            ) : (
                 <div className='text-center py-16 bg-card rounded-lg'>
                    <p className='text-muted-foreground'>Afsuski, kitoblar topilmadi.</p>
                </div>
            )
        )}
      </section>
    </div>
  );
}
