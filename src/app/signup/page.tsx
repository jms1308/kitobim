
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
  username: z.string().min(3, { message: "Foydalanuvchi nomi kamida 3 belgidan iborat bo'lishi kerak." }),
  phone: z.string().min(9, { message: "Telefon raqamini to'g'ri kiriting (+998...)." }),
  email: z.string().email({ message: "To'g'ri email manzil kiriting." }),
  password: z.string().min(6, { message: "Parol kamida 6 belgidan iborat bo'lishi kerak." }),
});

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      phone: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const { success, error } = await signup(values.username, values.phone, values.email, values.password);
    if (success) {
      toast({
        title: "Muvaffaqiyatli!",
        description: "Hisobingiz yaratildi. Endi tizimga kirishingiz mumkin.",
      });
      router.push('/login');
    } else {
        toast({
          variant: "destructive",
          title: "Xatolik!",
          description: error || "Ro'yxatdan o'tishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
        });
    }
    setIsSubmitting(false);
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Ro'yxatdan o'tish</CardTitle>
          <CardDescription>Yangi hisob yaratish</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foydalanuvchi nomi</FormLabel>
                    <FormControl>
                      <Input placeholder="kitobxon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon raqami</FormLabel>
                    <FormControl>
                      <Input placeholder="+998901234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="siz@email.com" {...field} />
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
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full transition-transform hover:scale-105" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ro'yxatdan o'tish
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Hisobingiz bormi?{' '}
            <Link href="/login" className="underline hover:text-primary">
              Kirish
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
