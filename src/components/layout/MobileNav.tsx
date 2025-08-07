
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusCircle, BookUser, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { href: '/', label: 'Asosiy', icon: Home },
  { href: '/catalog', label: 'Katalog', icon: Compass },
  { href: '/post-book', label: 'Qo\'shish', icon: PlusCircle, protected: true },
  { href: '/my-posts', label: 'E\'lonlarim', icon: BookUser, protected: true },
  { href: '/profile', label: 'Profil', icon: User, protected: true },
  { href: '/login', label: 'Kirish', icon: User, publicOnly: true },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const getVisibleLinks = () => {
    if (isAuthenticated) {
      // For logged-in users, show Home, Catalog, Add, My Posts, Profile
      return navLinks.filter(link => !link.publicOnly);
    }
    // For logged-out users, show Home, Catalog, Login
    return navLinks.filter(link => !link.protected);
  }
  
  const visibleLinks = getVisibleLinks();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50">
      <nav className="flex h-full items-center justify-around">
        {visibleLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors text-center whitespace-nowrap",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
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
