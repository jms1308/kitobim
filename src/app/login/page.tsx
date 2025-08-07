"use client";

import { useState } from 'react';
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
import { Loader2 } from 'lucide-react';

const phoneSchema = z.object({
  phone: z.string().min(9, { message: "Telefon raqamini to'g'ri kiriting (+998...)." }),
});

const otpSchema = z.object({
  phone: z.string(),
  token: z.string().min(6, { message: "Kod 6 ta raqamdan iborat bo'lishi kerak." }),
});

export default function LoginPage() {
  const { signInWithOtp, verifyOtp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  
  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });
  
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { phone: '', token: '' },
  });

  async function onPhoneSubmit(values: z.infer<typeof phoneSchema>) {
    setIsSubmitting(true);
    const { success, error } = await signInWithOtp(values.phone);
    if (success) {
      toast({ description: "Telefon raqamingizga tasdiqlash kodi yuborildi." });
      otpForm.setValue('phone', values.phone);
      setStep('otp');
    } else {
      toast({ variant: "destructive", title: "Xatolik!", description: error });
    }
    setIsSubmitting(false);
  }

  async function onOtpSubmit(values: z.infer<typeof otpSchema>) {
    setIsSubmitting(true);
    const { success, error } = await verifyOtp(values.phone, values.token);
    if (success) {
      toast({ title: "Muvaffaqiyatli!", description: "Xush kelibsiz!" });
      router.push('/profile');
    } else {
      toast({ variant: "destructive", title: "Xatolik!", description: error });
    }
    setIsSubmitting(false);
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Kirish</CardTitle>
          <CardDescription>
            {step === 'phone' ? "Tasdiqlash kodini olish uchun telefon raqamingizni kiriting" : "SMS orqali kelgan 6 xonali kodni kiriting"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6">
                <FormField
                  control={phoneForm.control}
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
                <Button type="submit" className="w-full transition-transform hover:scale-105" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Kod olish
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
                <FormField
                    control={otpForm.control}
                    name="phone"
                    render={({ field }) => <Input type="hidden" {...field} />}
                />
                <FormField
                  control={otpForm.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tasdiqlash kodi</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" {...field} />
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
          )}
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
