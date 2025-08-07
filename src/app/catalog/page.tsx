
"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
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


function CatalogView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Data states
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states initialized from URL search params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'all');
  
  const [maxPrice, setMaxPrice] = useState(500000);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseInt(searchParams.get('min_price') || '0', 10),
    parseInt(searchParams.get('max_price') || `${maxPrice}`, 10)
  ]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Update URL query string when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) params.set('q', searchQuery); else params.delete('q');
    if (selectedCategory !== 'all') params.set('category', selectedCategory); else params.delete('category');
    if (selectedCity !== 'all') params.set('city', selectedCity); else params.delete('city');
    if (priceRange[0] > 0) params.set('min_price', String(priceRange[0])); else params.delete('min_price');
    if (priceRange[1] < maxPrice) params.set('max_price', String(priceRange[1])); else params.delete('max_price');
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchQuery, selectedCategory, selectedCity, priceRange, pathname, router, maxPrice, searchParams]);


  // Fetch all necessary data on component mount
  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [booksData, categoriesData, citiesData] = await Promise.all([
                getBooks({}),
                getCategories(),
                getCities(),
            ]);

            setAllBooks(booksData);
            setCategories(['Barcha kategoriyalar', ...categoriesData]);
            setCities(['Barcha shaharlar', ...citiesData]);

            if (booksData.length > 0) {
                const maxBookPrice = Math.max(...booksData.map(b => b.price), 0);
                const newMaxPrice = Math.ceil((maxBookPrice || 500000) / 100000) * 100000;
                setMaxPrice(newMaxPrice);

                const maxParam = searchParams.get('max_price');
                if (!maxParam) {
                    setPriceRange(prev => [prev[0], newMaxPrice]);
                } else {
                    setPriceRange(prev => [prev[0], parseInt(maxParam, 10)])
                }
            }
        } catch (error) {
            console.error("Failed to fetch catalog data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredBooks = useMemo(() => {
    const currentCategory = searchParams.get('category');
    const currentCity = searchParams.get('city');
    const currentQuery = searchParams.get('q')?.toLowerCase();
    const currentMinPrice = parseInt(searchParams.get('min_price') || '0', 10);
    const currentMaxPrice = parseInt(searchParams.get('max_price') || `${maxPrice}`, 10);

    return allBooks.filter(book => {
      const searchMatch = !currentQuery ||
        book.title.toLowerCase().includes(currentQuery) || 
        book.author.toLowerCase().includes(currentQuery);
      
      const categoryMatch = !currentCategory || book.category === currentCategory;
      const cityMatch = !currentCity || book.city === currentCity;
      const priceMatch = book.price >= currentMinPrice && book.price <= currentMaxPrice;

      return searchMatch && categoryMatch && cityMatch && priceMatch;
    });
  }, [allBooks, searchParams, maxPrice]);
  

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCity('all');
    setPriceRange([0, maxPrice]);
  };
  
  const activeFiltersCount = [
      selectedCategory !== 'all',
      selectedCity !== 'all',
      searchQuery !== '',
      priceRange[0] !== 0 || priceRange[1] !== maxPrice
    ].filter(Boolean).length;
    
  const FilterControls = () => (
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
            <label className="text-sm font-medium mb-2 block">Narx oralig'i</label>
            <Slider
                min={0}
                max={maxPrice}
                step={10000}
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{new Intl.NumberFormat('uz-UZ').format(priceRange[0])} so'm</span>
                <span>{new Intl.NumberFormat('uz-UZ').format(priceRange[1])} so'm</span>
            </div>
        </div>
        <Button onClick={handleResetFilters} variant="outline" className="w-full">Filtrlarni tozalash</Button>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-1/4 lg:w-1/5">
        <div className="sticky top-20 space-y-6">
          <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen} className="md:hidden">
             <div className="flex justify-between items-center p-4 border rounded-lg bg-card shadow-sm">
                <CollapsibleTrigger asChild>
                  <div className="w-full text-left flex items-center gap-2" role="button">
                      <FilterIcon className="h-5 w-5" />
                      <h3 className="text-lg font-bold">
                          Filtrlar
                          {activeFiltersCount > 0 && (
                              <Badge variant="secondary" className="ml-2">{activeFiltersCount}</Badge>
                          )}
                      </h3>
                  </div>
                </CollapsibleTrigger>
                <Button variant="ghost" size="icon" onClick={() => setIsFilterOpen(prev => !prev)}>
                    <ChevronDown className={`h-5 w-5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </Button>
            </div>
             <CollapsibleContent>
                <div className="p-4 mt-2 border rounded-lg md:p-0 md:mt-0 md:border-none space-y-4">
                    <FilterControls />
                </div>
             </CollapsibleContent>
          </Collapsible>
          
           <div className="hidden md:block space-y-6">
             <h3 className="text-xl font-bold">Filtrlar</h3>
             <FilterControls />
             <div className="space-y-2 pt-4">
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
                      {(priceRange[0] !== 0 || priceRange[1] !== maxPrice) && (
                         <Badge variant="secondary" className="flex items-center gap-1">
                            Narx
                            <button onClick={() => setPriceRange([0, maxPrice])}><X className="h-3 w-3" /></button>
                        </Badge>
                      )}
                  </div>
              ) : (
                  <p className="text-xs text-muted-foreground">Filtrlar tanlanmagan</p>
              )}
            </div>
          </div>
        </div>
      </aside>

      <main className="w-full md:w-3/4 lg:w-4/5">
        <h1 className="text-3xl font-bold font-headline mb-6">Barcha e'lonlar</h1>
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
                <div className='text-center py-16 bg-card rounded-lg border-2 border-dashed'>
                    <h3 className="text-xl font-semibold">Kitoblar topilmadi</h3>
                    <p className='text-muted-foreground mt-2'>Sizning filtringizga mos keladigan kitoblar yo'q.</p>
                    <Button onClick={handleResetFilters} className="mt-4">Filtrlarni tozalash</Button>
                </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function CatalogPageSkeleton() {
    return (
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-1/4 lg:w-1/5">
                <div className="sticky top-20 space-y-6">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </aside>
            <main className="w-full md:w-3/4 lg:w-4/5">
                <Skeleton className="h-8 w-1/3 mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({length: 12}).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
                </div>
            </main>
        </div>
    )
}

export default function CatalogPage() {
    return (
        <Suspense fallback={<CatalogPageSkeleton />}>
            <CatalogView />
        </Suspense>
    )
}
