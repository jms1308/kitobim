"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().min(1, { message: "Email yoki telefon raqamini kiriting." }),
  password: z.string().min(6, { message: "Parol kamida 6 belgidan iborat bo'lishi kerak." }),
});

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const { success, error } = await login(values.email, values.password);
      if (success) {
        toast({
          title: "Muvaffaqiyatli!",
          description: "Xush kelibsiz!",
        });
        router.push('/profile');
      } else {
        toast({
          variant: "destructive",
          title: "Xatolik!",
          description: error || "Email yoki parol noto'g'ri.",
        });
      }
    } catch (error) {
       toast({
          variant: "destructive",
          title: "Xatolik!",
          description: "Tizimga kirishda noma'lum xatolik.",
        });
    } finally {
       setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Kirish</CardTitle>
          <CardDescription>Hisobingizga kiring</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email yoki Telefon raqami</FormLabel>
                    <FormControl>
                      <Input placeholder="siz@example.com yoki +998..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parol</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full transition-transform hover:scale-105" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kirish
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Hisobingiz yo'qmi?{' '}
            <Link href="/signup" className="underline hover:text-primary">
              Ro'yxatdan o'tish
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
