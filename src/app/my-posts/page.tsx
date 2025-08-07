"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getBooks, deleteBook } from '@/lib/api';
import type { Book } from '@/lib/types';
import BookCard from '@/components/BookCard';
import AuthGuard from '@/components/AuthGuard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

function MyPostsPageContent() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setLoading(true);
      const userBooks = getBooks({ userId: user.id });
      setBooks(userBooks);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleDelete = async (bookId: string) => {
    if (!user) return;
    const result = deleteBook(bookId, user.id);
    if (result.success) {
      setBooks(books.filter(book => book.id !== bookId));
      toast({
        title: "Muvaffaqiyatli!",
        description: "E'lon o'chirildi.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Xatolik!",
        description: "E'lonni o'chirishda xatolik yuz berdi.",
      });
    }
  };

  if (loading) {
    return (
        <div>
        <h1 className="text-3xl font-bold font-headline mb-6">Mening e'lonlarim</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Mening e'lonlarim</h1>
      {books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <div key={book.id} className="relative group">
              <BookCard book={book} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Ishonchingiz komilmi?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bu amalni qaytarib bo'lmaydi. Bu sizning e'loningizni serverlarimizdan butunlay o'chirib tashlaydi.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(book.id)}>
                        O'chirish
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-lg border-2 border-dashed">
            <h3 className="text-xl font-semibold">Sizda hali e'lonlar yo'q</h3>
            <p className="text-muted-foreground mt-2 mb-4">Birinchi kitobingizni sotishni boshlang!</p>
            <Button asChild>
                <Link href="/post-book">Kitob joylashtirish</Link>
            </Button>
        </div>
      )}
    </div>
  );
}


export default function MyPostsPage() {
    return (
        <AuthGuard>
            <MyPostsPageContent />
        </AuthGuard>
    )
}
