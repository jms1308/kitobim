
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
import { getBookById, updateBook, uploadBookImage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Loader2, Upload, CheckCircle2, AlertCircle, Camera } from 'lucide-react';
import Image from 'next/image';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
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
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Rasm hajmi 10MB dan oshmasligi kerak.`)
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Faqat .jpg, .jpeg, .png va .webp formatidagi rasmlar qabul qilinadi."
    ),
});

const categories = ["Badiiy adabiyot", "Tarixiy roman", "Bolalar adabiyoti", "Ilmiy", "Darslik", "Boshqa"];
const cities = ["Toshkent", "Samarqand", "Buxoro", "Farg'ona", "Andijon", "Namangan", "Qo'qon", "Xiva"];

function EditPostPageContent({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFetchingBook, setIsFetchingBook] = useState(true);
  const id = params.id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        title: '',
        author: '',
        price: 0,
        description: '',
        category: '',
        city: '',
        condition: 'yaxshi',
    },
  });
  
  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      setIsFetchingBook(true);
      try {
        const bookData = await getBookById(id as string);
        if (bookData) {
            if (user && bookData.sellerId !== user.id) {
                toast({ variant: 'destructive', title: "Ruxsat yo'q!", description: "Siz faqat o'zingizning e'lonlaringizni tahrirlay olasiz."});
                router.push('/my-posts');
                return;
            }
            form.reset({
                ...bookData,
                price: bookData.price,
                image: undefined,
            });
            setImagePreview(bookData.imageUrl);
        } else {
            toast({ variant: 'destructive', title: "Xatolik!", description: "Kitob topilmadi."});
            router.push('/my-posts');
        }
      } catch (error) {
        toast({ variant: 'destructive', title: "Xatolik!", description: "Kitob ma'lumotlarini yuklashda xatolik."});
        router.push('/my-posts');
      } finally {
        setIsFetchingBook(false);
      }
    }
    fetchBook();
  }, [id, form, toast, router, user]);


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
        let imageUrl: string | undefined = imagePreview || undefined;
        
        if (values.image) {
            const uploadedUrl = await uploadBookImage(values.image);
            if (!uploadedUrl) {
                throw new Error("Rasm yuklashda xatolik yuz berdi.");
            }
            imageUrl = uploadedUrl;
        }

        const bookUpdateData = {
          ...values,
          imageUrl: imageUrl as string,
        };

        const updatedBook = await updateBook(id, bookUpdateData);

        if (updatedBook) {
            toast({
              title: (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> Muvaffaqiyat!
                </div>
              ),
              description: "Sizning e'loningiz yangilandi.",
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
                description: "E'lonni yangilashda xato yuz berdi." 
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
            description: error.message || "E'lonni yangilashda noma'lum xato yuz berdi." 
        });
    } finally {
        setIsLoading(false);
    }
  }

  if (isFetchingBook) {
      return (
          <div className="flex justify-center items-center h-96">
              <Loader2 className="h-12 w-12 animate-spin" />
          </div>
      )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">E'lonni tahrirlash</CardTitle>
        <CardDescription>Kitobingiz ma'lumotlarini o'zgartiring</CardDescription>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <FormControl>
                        <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                        />
                    </FormControl>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                     <Select onValueChange={field.onChange} value={field.value}>
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
                            <FormLabel>Kitob rasmini o'zgartirish (ixtiyoriy)</FormLabel>
                            <FormControl>
                                <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                                    <Camera className="mr-2 h-4 w-4" />
                                    Yangi rasm tanlash
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
                      <Image src={imagePreview} alt="Kitob rasmi" width={200} height={300} className="rounded-md object-contain max-h-[250px]" data-ai-hint="book cover"/>
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
                O'zgarishlarni saqlash
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


export default function EditPostPage({ params }: { params: { id: string } }) {
    return (
        <AuthGuard>
            <EditPostPageContent params={params} />
        </AuthGuard>
    )
}

    