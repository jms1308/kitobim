
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusCircle, BookUser, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { href: '/', label: 'Asosiy', icon: Home },
  { href: '/catalog', label: 'Katalog', icon: Compass },
  { href: '/post-book', label: 'Qo\'shish', icon: PlusCircle },
  { href: '/my-posts', label: 'E\'lonlarim', icon: BookUser },
  { href: '/profile', label: 'Profil', icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth(); // We still need this to decide behavior on protected routes, but not for rendering links

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50">
      <nav className="flex h-full items-center justify-around">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-all duration-200 ease-in-out text-center whitespace-nowrap rounded-lg py-1.5",
                isActive 
                  ? "text-primary bg-primary/10 scale-105" 
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <link.icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
