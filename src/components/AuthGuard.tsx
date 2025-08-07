"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until loading is finished, then check for authentication.
    // This effect should only run when loading status or authentication status changes.
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // While the initial authentication check is running, show a loader.
  // This should only be visible on the very first load of the application.
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render the children components.
  // This allows access to protected pages.
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If the user is not authenticated and loading is complete,
  // the redirection is in progress, so we render nothing.
  return null;
}
