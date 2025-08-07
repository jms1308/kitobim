"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { getBooks, getCategories, getCities } from '@/lib/api';
import type { Book } from '@/lib/types';
import BookCard from '@/components/BookCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';


const ITEMS_PER_PAGE = 12;

export default function CatalogPage() {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [booksData, categoriesData, citiesData] = await Promise.all([
        getBooks({}),
        getCategories(),
        getCities(),
      ]);
      setAllBooks(booksData);
      setCategories(['Barcha kategoriyalar', ...categoriesData]);
      setCities(['Barcha shaharlar', ...citiesData]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredBooks = useMemo(() => {
    return allBooks
      .filter(book => 
        (searchQuery === '' || 
         book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
         book.author.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .filter(book => selectedCategory === 'all' || book.category === selectedCategory)
      .filter(book => selectedCity === 'all' || book.city === selectedCity)
      .filter(book => book.price >= priceRange[0] && book.price <= priceRange[1]);
  }, [allBooks, searchQuery, selectedCategory, selectedCity, priceRange]);
  
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = filteredBooks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCity('all');
    setPriceRange([0, 200000]);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-1/4 lg:w-1/5">
        <div className="sticky top-20 space-y-6">
          <h3 className="text-xl font-bold">Filtrlar</h3>
          <div className="space-y-4">
             <div className="relative">
                <Input
                    type="search"
                    placeholder="Qidirish..."
                    className="pr-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
             </div>
            <div>
              <label className="text-sm font-medium">Kategoriya</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat === 'Barcha kategoriyalar' ? 'all' : cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Shahar</label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city} value={city === 'Barcha shaharlar' ? 'all' : city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
                <label className="text-sm font-medium">Narx oralig'i</label>
                <Slider
                    min={0}
                    max={200000}
                    step={5000}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value)}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{new Intl.NumberFormat('uz-UZ').format(priceRange[0])} so'm</span>
                    <span>{new Intl.NumberFormat('uz-UZ').format(priceRange[1])} so'm</span>
                </div>
            </div>
            <Button onClick={handleResetFilters} variant="outline" className="w-full">Filtrlarni tozalash</Button>
          </div>
        </div>
      </aside>
      <main className="w-full md:w-3/4 lg:w-4/5">
        <h1 className="text-3xl font-bold font-headline mb-6">Barcha kitoblar</h1>
        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                    <div key={index} className="space-y-2">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ))}
            </div>
        ) : (
          <>
            {filteredBooks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedBooks.map(book => <BookCard key={book.id} book={book} />)}
                </div>
            ) : (
                <div className='text-center py-16 bg-card rounded-lg'>
                    <p className='text-muted-foreground'>Filtrlarga mos kitoblar topilmadi.</p>
                </div>
            )}
            {totalPages > 1 && (
                 <Pagination className="mt-8">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href="#" onClick={(e) => {e.preventDefault(); handlePageChange(currentPage - 1)}} aria-disabled={currentPage === 1}/>
                        </PaginationItem>
                        
                        {Array.from({length: totalPages}).map((_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink href="#" onClick={(e) => {e.preventDefault(); handlePageChange(i + 1)}} isActive={currentPage === i + 1}>
                                {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                            <PaginationNext href="#" onClick={(e) => {e.preventDefault(); handlePageChange(currentPage + 1)}} aria-disabled={currentPage === totalPages}/>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
          </>
        )}
      </main>
    </div>
  );
}
