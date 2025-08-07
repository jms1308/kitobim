"use client";

import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Calendar, Book as BookIcon } from 'lucide-react';
import { format } from 'date-fns';

function ProfilePageContent() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-16">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // AuthGuard handles redirection
  }
  
  const getJoinDate = () => {
    if (typeof user.createdAt === 'string') {
      return new Date(user.createdAt);
    }
    return user.createdAt;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="w-full shadow-2xl">
        <CardHeader className="text-center items-center space-y-4 p-8 bg-muted/30">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarImage src={`https://api.dicebear.com/7.x/micah/svg?seed=${user.username}`} />
            <AvatarFallback className="text-3xl">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-3xl font-bold">{user.username}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2 mt-1">
              <Mail className="h-4 w-4" /> {user.email}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="flex items-center gap-4 bg-secondary p-4 rounded-lg">
                <Calendar className="h-8 w-8 text-primary"/>
                <div>
                    <p className="text-sm text-muted-foreground">Ro'yxatdan o'tgan sana</p>
                    <p className="font-semibold">{format(getJoinDate(), 'd MMMM, yyyy')}</p>
                </div>
            </div>
             <div className="flex items-center gap-4 bg-secondary p-4 rounded-lg">
                <BookIcon className="h-8 w-8 text-primary"/>
                <div>
                    <p className="text-sm text-muted-foreground">Joylashtirilgan e'lonlar soni</p>
                    <p className="font-semibold">{user.postsCount} ta kitob</p>
                </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button variant="destructive" onClick={logout}>
              Hisobdan chiqish
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
    return (
        <AuthGuard>
            <ProfilePageContent />
        </AuthGuard>
    )
}
