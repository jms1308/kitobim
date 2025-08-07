import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Book } from '@/lib/types';
import { MapPin, CalendarDays } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { uz } from 'date-fns/locale';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
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
    <Card className="flex flex-col overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="p-0 relative">
        <Link href={`/books/${book.id}`} className="block">
          <Image
            src={book.imageUrl}
            alt={book.title}
            width={400}
            height={400}
            className="w-full h-64 object-cover"
            data-ai-hint="book cover"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-lg font-bold leading-tight">
                <Link href={`/books/${book.id}`} className="hover:text-primary transition-colors">{book.title}</Link>
            </CardTitle>
            <Badge variant={conditionVariant[book.condition]} className="capitalize flex-shrink-0 ml-2">
                {book.condition}
            </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{book.author}</p>
      </CardContent>
      <CardFooter className="flex-col items-start p-4 bg-secondary/30">
        <p className="text-xl font-semibold text-primary mb-3">
          {new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(book.price)}
        </p>
        <div className="w-full flex justify-between text-xs text-muted-foreground">
            <div className='flex items-center gap-1'>
                <MapPin className="h-3 w-3" />
                <span>{book.city}</span>
            </div>
            <div className='flex items-center gap-1'>
                <CalendarDays className="h-3 w-3" />
                <span>{formatDistanceToNow(getBookDate(), { addSuffix: true, locale: uz })}</span>
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}
