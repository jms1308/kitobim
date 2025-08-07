"use client";

import { useState } from 'react';
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
import { Phone, User, MapPin, Tag, BookOpen, ThumbsUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';

export default function BookDetailsPage({ params }: { params: { id: string } }) {
  // Data is fetched synchronously, no loading state needed.
  const book = getBookById(params.id);

  if (!book) {
    return <div className="text-center py-10">Kitob topilmadi.</div>;
  }
  
  const conditionVariant = {
    yangi: 'default',
    yaxshi: 'secondary',
    yomon: 'destructive',
  } as const;

  const getBookDate = () => {
      if (typeof book.createdAt === 'string') {
        return new Date(book.createdAt);
      }
      return book.createdAt;
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto bg-card p-8 rounded-2xl shadow-lg">
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
      <div className="flex flex-col">
        <Badge variant={conditionVariant[book.condition]} className="capitalize w-fit mb-2">{book.condition}</Badge>
        <h1 className="text-4xl font-bold font-headline mb-2">{book.title}</h1>
        <p className="text-xl text-muted-foreground mb-4">{book.author}</p>
        <p className="text-3xl font-bold text-primary mb-6">
          {new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(book.price)}
        </p>
        
        <div className="space-y-4 text-sm text-foreground/80 mb-6">
            <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /> <span>{book.city}</span></div>
            <div className="flex items-center gap-3"><Tag className="h-5 w-5 text-primary" /> <span>{book.category}</span></div>
            <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-primary" /> <span>E'lon qo'yildi: {format(getBookDate(), "d MMMM, yyyy", {locale: uz})}</span></div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><BookOpen className="h-5 w-5" /> Batafsil ma'lumot</h3>
          <p className="text-foreground/90 leading-relaxed">{book.description}</p>
        </div>

        <div className="mt-auto pt-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full text-lg transition-transform hover:scale-105">
                <Phone className="mr-2 h-5 w-5" />
                Sotuvchi bilan bog'lanish
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl">Sotuvchi ma'lumotlari</DialogTitle>
                <DialogDescription>
                  Kitobni sotib olish uchun sotuvchi bilan bog'laning.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
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
  );
}
