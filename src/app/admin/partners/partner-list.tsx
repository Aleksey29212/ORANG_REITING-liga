'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Partner, PartnerCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, Loader2, Save, Upload } from 'lucide-react';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addPartner, updatePartner, deletePartner } from '@/firebase/partners';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const partnerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Название должно быть не менее 2 символов.'),
  logoUrl: z.string().min(10, 'Необходимо указать URL или загрузить файл логотипа.'),
  category: z.enum(['shop', 'platform', 'media', 'other']),
  linkUrl: z.string().url('Неверный URL ссылки. Оставьте поле пустым, если ссылка не нужна.').or(z.literal('')).optional(),
  promoCode: z.string().optional(),
});

type PartnerFormValues = z.infer<typeof partnerSchema>;

const categoryLabels: Record<PartnerCategory, string> = {
    shop: 'Магазин',
    platform: 'Игровая платформа',
    media: 'Инфо-партнер',
    other: 'Другое',
};

function PartnerDialog({ partner, onOpenChange, open }: { partner?: Partner; onOpenChange: (open: boolean) => void; open: boolean }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const db = useFirestore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<PartnerFormValues>({
        resolver: zodResolver(partnerSchema),
        defaultValues: partner || { name: '', logoUrl: '', category: 'shop', linkUrl: '', promoCode: '' },
    });
    
    const logoUrlValue = form.watch('logoUrl');

    useEffect(() => {
        form.reset(partner || { name: '', logoUrl: '', category: 'shop', linkUrl: '', promoCode: '' });
    }, [partner, open, form]);


    const isEditing = !!partner;

    async function onSubmit(data: PartnerFormValues) {
        if (!db) return;
        const dataToSave = { ...data, linkUrl: data.linkUrl || '', promoCode: data.promoCode || '' };
        startTransition(() => {
            if (isEditing && partner?.id) {
                updatePartner(db, { ...dataToSave, id: partner.id });
                toast({ title: 'Успешно', description: 'Партнер обновлен.' });
            } else {
                addPartner(db, dataToSave);
                toast({ title: 'Успешно', description: 'Партнер добавлен.' });
            }
            onOpenChange(false);
        });
    }
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                form.setValue('logoUrl', reader.result as string, { shouldValidate: true });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glassmorphism sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Редактировать партнера' : 'Добавить партнера'}</DialogTitle>
                    <DialogDescription>
                        Введите информацию о партнере. Выберите категорию, чтобы правильно отобразить партнера на сайте.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                         <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Название</FormLabel><FormControl><Input placeholder="Название компании" {...field} /></FormControl><FormMessage /></FormItem>)} />
                         
                         <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Тип партнера</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Выберите тип" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="shop">Магазин</SelectItem>
                                        <SelectItem value="platform">Игровая платформа</SelectItem>
                                        <SelectItem value="media">Инфо-партнер</SelectItem>
                                        <SelectItem value="other">Другое</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                         )} />

                         <FormField control={form.control} name="logoUrl" render={({ field }) => ( 
                            <FormItem>
                                <FormLabel>URL или загрузка логотипа</FormLabel>
                                <div className="flex items-center gap-2">
                                    <FormControl>
                                        <Input placeholder="https://.../logo.png или загрузите файл" {...field} />
                                    </FormControl>
                                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                        <Upload /> Загрузить
                                    </Button>
                                    <Input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={handleFileSelect}
                                    />
                                </div>
                                {logoUrlValue && (
                                    <div className="flex justify-center p-2 mt-2 border rounded-lg bg-muted/50">
                                         <Image src={logoUrlValue} alt="Предпросмотр" width={120} height={60} className="object-contain" unoptimized={logoUrlValue.startsWith('data:image')} />
                                    </div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )} />

                         <FormField control={form.control} name="linkUrl" render={({ field }) => ( <FormItem><FormLabel>URL ссылки (необязательно)</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                         <FormField control={form.control} name="promoCode" render={({ field }) => ( <FormItem><FormLabel>Промокод (необязательно)</FormLabel><FormControl><Input placeholder="PROMO123" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Отмена</Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? <Loader2 className="animate-spin" /> : <Save />}
                                {isEditing ? 'Сохранить' : 'Добавить'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}


export function PartnerList() {
    const db = useFirestore();
    const partnersQuery = useMemoFirebase(() => db ? collection(db, 'partners') : null, [db]);
    const { data: partners, isLoading } = useCollection<Partner>(partnersQuery);

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<Partner | undefined>(undefined);
    const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [isDeletePending, startDeleteTransition] = useTransition();
    const { toast } = useToast();

    const handleEdit = (partner: Partner) => {
        setSelectedPartner(partner);
        setOpenDialog(true);
    };

    const handleAdd = () => {
        setSelectedPartner(undefined);
        setOpenDialog(true);
    };

    const handleDelete = (partner: Partner) => {
        setSelectedPartner(partner);
        setDeleteAlertOpen(true);
    };
    
    const confirmDelete = () => {
        if (!selectedPartner || !db) return;
        startDeleteTransition(() => {
            deletePartner(db, selectedPartner.id);
            toast({
                title: 'Успешно',
                description: 'Партнер удален.',
            });
            setDeleteAlertOpen(false);
            setSelectedPartner(undefined);
        });
    }

    return (
        <CardContent>
            <PartnerDialog partner={selectedPartner} open={openDialog} onOpenChange={setOpenDialog} />

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                <AlertDialogContent className="glassmorphism">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить партнера "{selectedPartner?.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>Это действие необратимо.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} disabled={isDeletePending} className="bg-destructive hover:bg-destructive/90">
                             {isDeletePending ? <Loader2 className="animate-spin" /> : 'Да, удалить'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="flex justify-end mb-4">
                <Button onClick={handleAdd}><PlusCircle />Добавить партнера</Button>
            </div>
            {isLoading && (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            )}
            {!isLoading && partners && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Логотип</TableHead>
                            <TableHead>Название</TableHead>
                            <TableHead>Тип</TableHead>
                            <TableHead>Ссылка</TableHead>
                            <TableHead>Промокод</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {partners.map((partner) => (
                            <TableRow key={partner.id}>
                                <TableCell>
                                    <Image src={partner.logoUrl} alt={partner.name} width={80} height={40} className="object-contain rounded-sm bg-white p-1" unoptimized={partner.logoUrl.startsWith('data:image')} />
                                </TableCell>
                                <TableCell className="font-medium">{partner.name}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">
                                        {categoryLabels[partner.category] || partner.category}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {partner.linkUrl ? (
                                        <a href={partner.linkUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate inline-block max-w-[150px]">{partner.linkUrl}</a>
                                    ) : (
                                        <span className="text-muted-foreground">Нет ссылки</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {partner.promoCode ? (
                                        <span className="font-mono text-sm">{partner.promoCode}</span>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">Нет</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(partner)}><Edit/></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(partner)}><Trash2/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
            {!isLoading && partners?.length === 0 && <p className="text-center text-muted-foreground py-8">Партнеры еще не добавлены.</p>}
        </CardContent>
    );
}
