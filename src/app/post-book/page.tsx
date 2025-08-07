
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { addBook } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, Upload, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const formSchema = z.object({
  title: z.string().min(3, { message: "Sarlavha kamida 3 belgidan iborat bo'lishi kerak." }),
  author: z.string().min(3, { message: "Muallif ismi kamida 3 belgidan iborat bo'lishi kerak." }),
  condition: z.enum(['yangi', 'yaxshi', 'yomon'], { required_error: "Holatini tanlang." }),
  price: z.coerce.number().min(0, { message: "Narx manfiy bo'lishi mumkin emas." }),
  category: z.string().min(1, { message: "Kategoriyani tanlang." }),
  city: z.string().min(1, { message: "Shaharni tanlang." }),
  description: z.string().min(20, { message: "Tavsif kamida 20 belgidan iborat bo'lishi kerak." }),
  imageUrl: z.string().url({ message: "To'g'ri rasm URL manzilini kiriting." }),
});

const categories = ["Badiiy adabiyot", "Tarixiy roman", "Bolalar adabiyoti", "Ilmiy", "Darslik", "Boshqa"];
const cities = ["Toshkent", "Samarqand", "Buxoro", "Farg'ona", "Andijon", "Namangan", "Qo'qon", "Xiva"];


function PostBookPageContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      author: '',
      price: 0,
      description: '',
      imageUrl: '',
    },
  });
  
  const imageUrlValue = form.watch("imageUrl");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: 'destructive', title: "Siz tizimga kirmagansiz" });
        return;
    }
    setIsLoading(true);
    try {
        const newBook = await addBook({ ...values, sellerId: user.id });
        if (newBook) {
            toast({
              title: (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> Muvaffaqiyat!
                </div>
              ),
              description: "Sizning e'loningiz joylashtirildi.",
            });
            router.push(`/catalog`);
        } else {
             toast({ 
                variant: 'destructive', 
                title: (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" /> Xatolik!
                  </div>
                ),
                description: "E'lonni joylashtirishda xato yuz berdi." 
            });
        }
    } catch (error) {
        toast({ 
            variant: 'destructive',
            title: (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" /> Xatolik!
                </div>
            ),
            description: "E'lonni joylashtirishda xato yuz berdi." 
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Yangi e'lon joylashtirish</CardTitle>
        <CardDescription>Sotmoqchi bo'lgan kitobingiz haqida ma'lumot bering</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kitob sarlavhasi</FormLabel>
                    <FormControl><Input placeholder="Masalan, 'O'tkan Kunlar'" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Muallif</FormLabel>
                    <FormControl><Input placeholder="Masalan, Abdulla Qodiriy" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Holati</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Kitob holatini tanlang" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="yangi">Yangi</SelectItem>
                        <SelectItem value="yaxshi">Yaxshi</SelectItem>
                        <SelectItem value="yomon">Yomon</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Narx (so'mda)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoriya</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl><SelectTrigger><SelectValue placeholder="Kategoriyani tanlang" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shahar</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl><SelectTrigger><SelectValue placeholder="Shaharni tanlang" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6 items-start">
                <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Rasm URL manzili</FormLabel>
                            <FormControl><Input placeholder="https://example.com/rasm.png" {...field} /></FormControl>
                            <Button asChild variant="link" size="sm" className="p-0 h-auto">
                                <Link href="https://postimages.org/" target="_blank" rel="noopener noreferrer">
                                    Rasm yuklash va link olish
                                    <ExternalLink className="ml-1.5 h-4 w-4" />
                                </Link>
                            </Button>
                          <FormMessage />
                          </FormItem>
                      )}
                    />
                    <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Batafsil tavsif</FormLabel>
                        <FormControl><Textarea placeholder="Kitob haqida qo'shimcha ma'lumotlar..." rows={6} {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                 <div className="flex flex-col items-center justify-center h-full bg-muted/50 rounded-lg p-4">
                    <FormLabel className="mb-2">Rasm ko'rinishi</FormLabel>
                    {imageUrlValue ? (
                    <Image src={imageUrlValue} alt="Kitob rasmi" width={200} height={300} className="rounded-md object-cover" />
                    ) : (
                    <div className="w-full h-48 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <Upload className="h-10 w-10 mb-2" />
                        <p>Rasm URL manzilini kiriting</p>
                    </div>
                    )}
                </div>
            </div>
            
            <Button type="submit" size="lg" className="w-full transition-transform hover:scale-105" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                E'lonni joylashtirish
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


export default function PostBookPage() {
    return (
        <AuthGuard>
            <PostBookPageContent />
        </AuthGuard>
    )
}
