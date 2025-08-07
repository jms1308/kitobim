
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter as FilterIcon, X, ChevronDown } from 'lucide-react';


export default function CatalogPage() {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>(['Barcha kategoriyalar']);
  const [cities, setCities] = useState<string[]>(['Barcha shaharlar']);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        const [booksData, categoriesData, citiesData] = await Promise.all([
            getBooks({}),
            getCategories(),
            getCities(),
        ]);
        setAllBooks(booksData);
        setCategories(['Barcha kategoriyalar', ...categoriesData]);
        setCities(['Barcha shaharlar', ...citiesData]);
        setIsLoading(false);
    }
    fetchData();
  }, [])

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
  

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCity('all');
    setPriceRange([0, 200000]);
  };
  
  const activeFiltersCount = [
      selectedCategory !== 'all',
      selectedCity !== 'all',
      searchQuery !== '',
      priceRange[0] !== 0 || priceRange[1] !== 200000
    ].filter(Boolean).length;
    
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-1/4 lg:w-1/5">
        <div className="sticky top-20 space-y-6">
          <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen} className="md:block">
             <div className="flex justify-between items-center p-4 border rounded-lg bg-card md:p-0 md:border-none md:bg-transparent">
                <CollapsibleTrigger asChild>
                  <div className="w-full text-left">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                          <FilterIcon className="h-5 w-5 md:hidden" />
                          Filtrlar
                          {activeFiltersCount > 0 && (
                              <Badge variant="secondary" className="ml-2 md:hidden">{activeFiltersCount}</Badge>
                          )}
                      </h3>
                  </div>
                </CollapsibleTrigger>
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsFilterOpen(prev => !prev)}>
                    <ChevronDown className={`h-5 w-5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </Button>
            </div>
             <CollapsibleContent>
                <div className="p-4 mt-2 border rounded-lg md:p-0 md:mt-0 md:border-none space-y-4">
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
                        <label className="text-sm font-medium mb-2 block">Narx oralig'i</label>
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
             </CollapsibleContent>
          </Collapsible>
          
           <div className="hidden md:block space-y-2">
            <h4 className="font-semibold text-sm">Faol filtrlar:</h4>
             {activeFiltersCount > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            "{searchQuery}"
                            <button onClick={() => setSearchQuery('')}><X className="h-3 w-3" /></button>
                        </Badge>
                    )}
                    {selectedCategory !== 'all' && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            {selectedCategory}
                            <button onClick={() => setSelectedCategory('all')}><X className="h-3 w-3" /></button>

                        </Badge>
                    )}
                    {selectedCity !== 'all' && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            {selectedCity}
                            <button onClick={() => setSelectedCity('all')}><X className="h-3 w-3" /></button>
                        </Badge>
                    )}
                </div>
             ) : (
                <p className="text-xs text-muted-foreground">Filtrlar tanlanmagan</p>
             )}
          </div>

        </div>
      </aside>
      <main className="w-full md:w-3/4 lg:w-4/5">
        <h1 className="text-3xl font-bold font-headline mb-6">Barcha kitoblar</h1>
        {isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({length: 12}).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
            </div>
        ) : (
          <>
            {filteredBooks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBooks.map(book => <BookCard key={book.id} book={book} />)}
                </div>
            ) : (
                <div className='text-center py-16 bg-card rounded-lg'>
                    <p className='text-muted-foreground'>Filtrlarga mos kitoblar topilmadi.</p>

                </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
