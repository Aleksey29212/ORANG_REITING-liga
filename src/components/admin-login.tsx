
'use client';

import { useAdmin } from "@/context/admin-context";
import { useRouter } from 'next/navigation';
import { Target, LogIn } from 'lucide-react';
import { useIsClient } from "@/hooks/use-is-client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";

// 12 Nature Landscapes
const natureImages = [
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1511497584788-876760111969",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff",
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a",
  "https://images.unsplash.com/photo-1500622345696-242427b32dfd",
  "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1"
];

// 43 Wise Quotes
const quotes = [
  "Великие дела совершаются не силой, а упорством. — Самуэль Джонсон",
  "Единственный способ сделать выдающуюся работу — искренне любить то, что вы делаете. — Стив Джобс",
  "Ваше время ограничено, не тратьте его, живя чужой жизнью. — Стив Джобс",
  "Не бойтесь совершенства, вам его никогда не достичь. — Сальвадор Дали",
  "Счастье — это не то, что вы откладываете на будущее, а то, что вы проектируете для настоящего. — Джим Рон",
  "Единственный способ подняться на вершину — это помогать другим подняться. — Неизвестный",
  "Успех — это способность идти от неудачи к неудаче, не теряя энтузиазма. — Уинстон Черчилль",
  "Логика может привести вас от А к Б. Воображение доставит вас куда угодно. — Альберт Эйнштейн",
  "Тот, кто боится упасть, никогда не полетит. — Неизвестный",
  "Жизнь — это то, что с тобой происходит, пока ты строишь планы. — Джон Леннон",
  "Лучший способ предсказать будущее — создать его. — Питер Друкер",
  "Начинать всегда тяжело, но результат того стоит. — Неизвестный",
  "Никогда не сдавайтесь, ведь именно в этот момент может произойти чудо. — Неизвестный",
  "Трудности — это не препятствия, а возможности стать сильнее. — Неизвестный",
  "Мастер — это тот, кто ошибался больше раз, чем новичок пробовал. — Неизвестный",
  "Дисциплина — это мост между целями и достижениями. — Джим Рон",
  "Каждый день — это шанс стать лучше, чем вчера. — Неизвестный",
  "Не ждите идеального момента, берите момент и делайте его идеальным. — Неизвестный",
  "Ваш успех зависит только от вашего желания его достичь. — Неизвестный",
  "Цель — это мечта со сроком исполнения. — Наполеон Хилл",
  "Путешествие в тысячу миль начинается с первого шага. — Лао-цзы",
  "Сила не в физических возможностях, а в несгибаемой воле. — Махатма Ганди",
  "Будьте переменой, которую вы хотите видеть в мире. — Махатма Ганди",
  "Улыбка — это кратчайшее расстояние между двумя людьми. — Виктор Борге",
  "Доброта — это язык, который могут слышать глухие и видеть слепые. — Марк Твен",
  "Ошибки — это доказательство того, что вы пытаетесь. — Неизвестный",
  "Ваши мысли создают вашу реальность. — Неизвестный",
  "Мечтайте так, как будто вы будете жить вечно. Живите так, как будто умрете сегодня. — Джеймс Дин",
  "Чтобы дойти до цели, надо прежде всего идти. — Оноре де Бальзак",
  "Великое начинается с малого. — Неизвестный",
  "Тот, кто знает, зачем жить, может вынести почти любое как. — Фридрих Ницше",
  "Держитесь подальше от людей, которые пытаются принизить ваши амбиции. — Марк Твен",
  "Знание — сила. — Фрэнсис Бэкон",
  "Всё в наших руках, поэтому их нельзя опускать. — Коко Шанель",
  "Если вы не можете сделать что-то великое, сделайте малое, но великим способом. — Наполеон Хилл",
  "Самое сложное — это начать действовать, остальное зависит только от упорства. — Амелия Эрхарт",
  "Верьте в себя, и вы будете неудержимы. — Неизвестный",
  "Ваш настрой определяет ваш успех. — Неизвестный",
  "Жизнь коротка, цените каждый миг. — Неизвестный",
  "Мудрость приходит с опытом, а опыт — с ошибками. — Неизвестный",
  "Самый богатый человек — это тот, кто доволен тем, что имеет. — Неизвестный",
  "Ничто не истина, всё дозволено. — Хасан ибн Саббах",
  "Порядок в доме — порядок в голове. — Неизвестный",
  "Упорство побеждает всё. — Вергилий"
];

export function AdminLoginTrigger() {
    const { isAdmin, login } = useAdmin();
    const router = useRouter();
    const isClient = useIsClient();
    
    const [isOpen, setIsOpen] = useState(false);
    const [showLoginFields, setShowLoginFields] = useState(false);
    const [password, setPassword] = useState("");
    const [currentImage, setCurrentImage] = useState("");
    const [currentQuote, setCurrentQuote] = useState("");

    // Randomize on each open
    useEffect(() => {
        if (isOpen) {
            setCurrentImage(natureImages[Math.floor(Math.random() * natureImages.length)]);
            setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
            setShowLoginFields(false);
            setPassword("");
        }
    }, [isOpen]);

    const handleClickPi = () => {
        if (isAdmin) {
            router.push('/admin');
        } else {
            setIsOpen(true);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login(password);
    };

    useEffect(() => {
        if (isAdmin && isOpen) {
            setIsOpen(false);
        }
    }, [isAdmin, isOpen]);

    if (!isClient) return null;

    return (
        <>
            <div 
                className="fixed bottom-4 right-4 p-4 cursor-pointer z-[100] group flex items-center justify-center h-16 w-16" 
                onClick={handleClickPi} 
                title={isAdmin ? "Перейти в панель администратора" : "Вход для администратора"}
            >
                 <Target className="h-2 w-2 text-primary opacity-5 group-hover:opacity-30 transition-opacity" />
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-4xl glassmorphism border-primary/20 bg-background/95 p-0 overflow-hidden outline-none">
                    <DialogTitle className="sr-only">Admin Gateway</DialogTitle>
                    
                    <div className="relative min-h-[600px] flex flex-col items-center justify-center p-8 md:p-12">
                        
                        {/* Framed Image Container */}
                        <div className="relative group perspective-1000 mb-8">
                            <div className="relative p-4 bg-[#1a1a1a] shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.05)] border-[12px] border-[#2a2a2a] rounded-sm transition-transform duration-700 hover:rotate-y-2">
                                <div className="relative w-[300px] h-[400px] md:w-[500px] md:h-[350px] overflow-hidden bg-muted">
                                    {currentImage && (
                                        <Image 
                                            src={currentImage} 
                                            alt="Nature landscape" 
                                            fill 
                                            className="object-cover animate-in fade-in duration-1000"
                                            unoptimized
                                        />
                                    )}

                                    {/* Secret Lambda inside the picture (bottom left) */}
                                    <div 
                                        className="absolute bottom-2 left-2 cursor-pointer p-3 z-50 transition-opacity opacity-[0.03] hover:opacity-40"
                                        onClick={() => setShowLoginFields(!showLoginFields)}
                                    >
                                        <span className="text-xl font-serif text-white">λ</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Aphorism */}
                        <div className="max-w-2xl text-center space-y-4 animate-in slide-in-from-bottom-4 duration-1000">
                            <p className="text-xl md:text-2xl font-body italic text-foreground/80 leading-relaxed">
                                &laquo;{currentQuote.split(' — ')[0]}&raquo;
                            </p>
                            <p className="text-sm uppercase tracking-[0.3em] text-primary/60 font-bold">
                                {currentQuote.split(' — ')[1]}
                            </p>
                        </div>

                        {/* Login Fields (Animated reveal) */}
                        <div className={cn(
                            "mt-8 w-full max-w-sm transition-all duration-500 overflow-hidden",
                            showLoginFields ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                        )}>
                            <form onSubmit={handleLogin} className="flex gap-2 p-1">
                                <Input 
                                    type="password" 
                                    placeholder="Введите код доступа..." 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-black/40 border-primary/30"
                                    autoFocus
                                />
                                <Button type="submit" variant="default" className="shrink-0">
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Войти
                                </Button>
                            </form>
                        </div>

                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
