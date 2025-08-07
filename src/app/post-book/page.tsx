
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
import { addBook, uploadBookImage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { Loader2, Upload, CheckCircle2, AlertCircle, Camera } from 'lucide-react';
import Image from 'next/image';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];


const formSchema = z.object({
  title: z.string().min(3, { message: "Sarlavha kamida 3 belgidan iborat bo'lishi kerak." }),
  author: z.string().min(3, { message: "Muallif ismi kamida 3 belgidan iborat bo'lishi kerak." }),
  condition: z.enum(['yangi', 'yaxshi', 'yomon'], { required_error: "Holatini tanlang." }),
  price: z.coerce.number().min(0, { message: "Narx manfiy bo'lishi mumkin emas." }),
  category: z.string().min(1, { message: "Kategoriyani tanlang." }),
  city: z.string().min(1, { message: "Shaharni tanlang." }),
  description: z.string().min(20, { message: "Tavsif kamida 20 belgidan iborat bo'lishi kerak." }),
  image: z
    .instanceof(File, { message: "Iltimos, rasm faylini tanlang." })
    .refine((file) => file.size <= MAX_FILE_SIZE, `Rasm hajmi 2MB dan oshmasligi kerak.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Faqat .jpg, .jpeg, .png va .webp formatidagi rasmlar qabul qilinadi."
    ),
});

const categories = ["Badiiy adabiyot", "Tarixiy roman", "Bolalar adabiyoti", "Ilmiy", "Darslik", "Boshqa"];
const cities = ["Toshkent", "Samarqand", "Buxoro", "Farg'ona", "Andijon", "Namangan", "Qo'qon", "Xiva"];


function PostBookPageContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      author: '',
      price: 0,
      description: '',
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: 'destructive', title: "Siz tizimga kirmagansiz" });
        return;
    }
    setIsLoading(true);
    try {
        const imageUrl = await uploadBookImage(values.image);
        if (!imageUrl) {
            throw new Error("Rasm yuklashda xatolik yuz berdi.");
        }

        const newBook = await addBook({ 
            ...values,
            imageUrl,
            sellerId: user.id 
        });

        if (newBook) {
            toast({
              title: (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> Muvaffaqiyat!
                </div>
              ),
              description: "Sizning e'loningiz joylashtirildi.",
            });
            router.push(`/my-posts`);
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
    } catch (error: any) {
        toast({ 
            variant: 'destructive',
            title: (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" /> Xatolik!
                </div>
            ),
            description: error.message || "E'lonni joylashtirishda noma'lum xato yuz berdi." 
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
                      name="image"
                      render={() => (
                          <FormItem>
                            <FormLabel>Kitob rasmi</FormLabel>
                            <FormControl>
                                <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                                    <Camera className="mr-2 h-4 w-4" />
                                    Rasm tanlash
                                </Button>
                            </FormControl>
                            <Input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                onChange={handleImageChange}
                                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                            />
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
                 <div className="flex flex-col items-center justify-center h-full bg-muted/50 rounded-lg p-4 min-h-[220px]">
                    <FormLabel className="mb-2 self-start">Rasm ko'rinishi</FormLabel>
                    {imagePreview ? (
                      <Image src={imagePreview} alt="Kitob rasmi" width={200} height={300} className="rounded-md object-contain max-h-[250px]" data-ai-hint="book cover" />
                    ) : (
                    <div className="w-full flex-grow flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <Upload className="h-10 w-10 mb-2" />
                        <p className="text-center">Rasm tanlanmagan</p>
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
