

"use client";

import Link from 'next/link';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutGrid, Book, PlusCircle, User as UserIcon, LogOut, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: "Bosh Sahifa", icon: LayoutGrid },
  { href: '/catalog', label: "Katalog", icon: Book },
  { href: '/post-book', label: "Kitob Joylash", icon: PlusCircle },
];

export default function Header() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        <nav className="hidden md:flex items-center space-x-6 ml-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
            {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
            ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatarUrl} alt={user.username} />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.phone}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-posts"><Book className="mr-2 h-4 w-4" /> Mening e'lonlarim</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile"><UserIcon className="mr-2 h-4 w-4" /> Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Chiqish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className='hidden md:flex items-center space-x-2'>
              <Button asChild variant="ghost">
                <Link href="/login">Kirish</Link>
              </Button>
              <Button asChild className="transition-transform hover:scale-105">
                <Link href="/signup">Ro'yxatdan o'tish</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
