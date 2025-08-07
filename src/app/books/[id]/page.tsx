
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBookById } from '@/lib/api';
import type { Book } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Phone, User, MapPin, Tag, BookOpen, Calendar, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

function BookDetailsSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-32" />
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
                <Skeleton className="w-full h-[600px] rounded-xl" />
                <div className="flex flex-col space-y-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-10 w-1/3 mb-4" />
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                    </div>
                    <div className="space-y-2 pt-4">
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                    <div className="mt-auto pt-6">
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function BookDetailsPage({ params: { id } }: { params: { id: string } }) {
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBook = async () => {
        setIsLoading(true);
        if (id) {
            const bookData = await getBookById(id);
            setBook(bookData);
        }
        setIsLoading(false);
    }
    fetchBook();
  }, [id]);


  if (isLoading) {
    return <BookDetailsSkeleton />;
  }

  if (!book) {
    return <div className="text-center py-10">Kitob topilmadi.</div>;
  }
  
  const conditionVariant = {
    yangi: 'default',
    yaxshi: 'secondary',
    yomon: 'destructive',
  } as const;


  return (
    <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Qaytish
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto bg-card p-4 md:p-8 rounded-2xl shadow-lg">
          <div className="w-full">
              <Image
              src={book.imageUrl}
              alt={book.title}
              width={600}
              height={800}
              className="w-full h-auto object-contain rounded-xl"
              data-ai-hint="book cover"
              />
          </div>
          <div className="flex flex-col min-w-0">
              <Badge variant={conditionVariant[book.condition]} className="capitalize w-fit mb-2">{book.condition}</Badge>
              <h1 className="text-2xl md:text-4xl font-bold font-headline mb-2 break-words">{book.title}</h1>
              <p className="text-base md:text-xl text-muted-foreground mb-4">{book.author}</p>
              <p className="text-xl md:text-3xl font-bold text-primary mb-6">
              {new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(book.price)}
              </p>
              
              <div className="space-y-4 text-sm text-foreground/80 mb-6">
                  <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /> <span>{book.city}</span></div>
                  <div className="flex items-center gap-3"><Tag className="h-5 w-5 text-primary" /> <span>{book.category}</span></div>
                  <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-primary" /> <span>E'lon qo'yildi: {format(new Date(book.createdAt), "d MMMM, yyyy", {locale: uz})}</span></div>
              </div>

              <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><BookOpen className="h-5 w-5" /> Batafsil ma'lumot</h3>
              <p className="text-foreground/90 leading-relaxed text-sm md:text-base break-words">{book.description}</p>
              </div>

              <div className="mt-auto pt-6">
              <Dialog>
                  <DialogTrigger asChild>
                  <Button size="lg" className="w-full text-sm md:text-base transition-transform hover:scale-105">
                      <Phone className="mr-2 h-5 w-5" />
                      Sotuvchi bilan bog'lanish
                  </Button>
                  </DialogTrigger>
                  <DialogContent>
                  <DialogHeader>
                      <DialogTitle className="text-xl md:text-2xl">Sotuvchi ma'lumotlari</DialogTitle>
                      <DialogDescription>
                      Kitobni sotib olish uchun sotuvchi bilan bog'laning.
                      </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4 text-sm md:text-base">
                      <div className="flex items-center gap-4">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <span>{book.sellerContact?.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <a href={`tel:${book.sellerContact?.phone}`} className="text-primary hover:underline">{book.sellerContact?.phone}</a>
                      </div>
                  </div>
                  </DialogContent>
              </Dialog>
              </div>
          </div>
        </div>
    </div>
  );
}
