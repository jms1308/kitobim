import Link from 'next/link';
import { Book } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-xl font-bold text-primary", className)}>
      <Book className="h-7 w-7" />
      <span className="font-headline">Kitobim 2.0</span>
    </Link>
  );
}
