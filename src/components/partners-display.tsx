'use client';

import Image from 'next/image';
import { Button } from './ui/button';
import { Copy, Check, ExternalLink, Handshake, PlusCircle, Info, ShoppingBag, Gamepad2, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useRef } from 'react';
import type { Partner, Tournament, PartnerCategory } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const categoryConfig: Record<PartnerCategory, { label: string; btnText: string; icon: any }> = {
    shop: { label: 'Магазин', btnText: 'В магазин', icon: ShoppingBag },
    platform: { label: 'Платформа', btnText: 'На платформу', icon: Gamepad2 },
    media: { label: 'Медиа', btnText: 'Перейти', icon: Globe },
    other: { label: 'Партнер', btnText: 'Подробнее', icon: ExternalLink },
};

function PromoCode({ code }: { code: string }) {
    const { toast } = useToast();
    const [hasCopied, setHasCopied] = useState(false);

    const copyToClipboard = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        navigator.clipboard.writeText(code);
        setHasCopied(true);
        toast({
            title: 'Скопировано!',
            description: `Промокод "${code}" скопирован в буфер обмена.`,
        });
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">Промокод:</span>
            <Button size="sm" variant="ghost" className="h-auto px-2 py-1 text-primary font-mono" onClick={copyToClipboard}>
                {code}
                {hasCopied ? <Check className="ml-2 text-success" /> : <Copy className="ml-2" />}
            </Button>
        </div>
    );
}

function PartnerCard({ partner, variant }: { partner: Partner; variant: 'default' | 'compact' }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const flipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isCompact = variant === 'compact';
    
    const containerClasses = isCompact ? 'h-28 w-44' : 'h-44 w-44';
    const padding = isCompact ? 'p-3' : 'p-5';
    
    const config = categoryConfig[partner.category] || categoryConfig.other;
    const CategoryIcon = config.icon;

    const handleCardClick = () => {
        if (flipTimeoutRef.current) {
            clearTimeout(flipTimeoutRef.current);
            flipTimeoutRef.current = null;
        }

        const nextFlipState = !isFlipped;
        setIsFlipped(nextFlipState);

        if (nextFlipState) {
            flipTimeoutRef.current = setTimeout(() => {
                setIsFlipped(false);
                flipTimeoutRef.current = null;
            }, 5000);
        }
    };
    
    useEffect(() => {
        return () => {
            if (flipTimeoutRef.current) {
                clearTimeout(flipTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div 
            className="group [perspective:1000px] cursor-pointer"
            onClick={handleCardClick}
        >
            <div className={cn(
                "relative rounded-xl transition-all duration-500 [transform-style:preserve-3d] shadow-lg led-glow border-2", 
                containerClasses, 
                isFlipped ? "[transform:rotateY(180deg)] scale-105" : "group-hover:scale-105"
            )}>
                {/* Front - Logo Side - Themed Designer Container */}
                <div className={cn(
                    "absolute inset-0 bg-secondary/20 backdrop-blur-md border border-primary/5 rounded-xl flex items-center justify-center [backface-visibility:hidden] shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] group-hover:bg-secondary/40 transition-colors", 
                    padding,
                )}>
                    <div className="relative w-full h-full flex items-center justify-center">
                        <Image
                            src={partner.logoUrl}
                            alt={partner.name}
                            fill
                            className="object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-md"
                            unoptimized={partner.logoUrl.startsWith('data:image')}
                        />
                    </div>
                    {/* Interaction Hint */}
                    <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-40 transition-opacity">
                        <Info className="h-3 w-3 text-primary" />
                    </div>
                </div>
                {/* Back - Info Side */}
                <div className="absolute inset-0 p-4 bg-card/95 backdrop-blur-xl border border-primary/50 rounded-xl flex flex-col items-center justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] text-center shadow-2xl">
                    <div className="w-full">
                        <p className={cn(
                            "font-bold text-primary truncate",
                            isCompact ? 'text-sm' : 'text-base'
                        )}>{partner.name}</p>
                        {partner.promoCode && <PromoCode code={partner.promoCode} />}
                    </div>

                    {partner.linkUrl && (
                        <Button 
                            asChild 
                            variant="default" 
                            className="w-full h-8 text-[10px] uppercase font-bold tracking-tighter"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                           <a href={partner.linkUrl} target="_blank" rel="noopener noreferrer">
                             <CategoryIcon className="mr-1.5 h-3 w-3" />
                             {config.btnText}
                           </a>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function RecruitmentCard({ variant }: { variant: 'default' | 'compact' }) {
    const isCompact = variant === 'compact';
    const containerClasses = isCompact ? 'h-28 w-44' : 'h-44 w-44';

    return (
        <Link href="/partners" className="group block">
            <div className={cn(
                "relative rounded-xl border-2 border-dashed bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center text-center p-4 group-hover:scale-105 led-glow",
                containerClasses
            )}>
                <div className="bg-primary/20 p-2 rounded-full mb-2 group-hover:bg-primary/30 transition-colors">
                    <PlusCircle className="text-primary h-6 w-6" />
                </div>
                <p className={cn(
                    "font-bold text-primary uppercase tracking-tight",
                    isCompact ? 'text-[10px]' : 'text-xs'
                )}>СТАТЬ ПАРТНЕРОМ</p>
                <p className="text-[8px] text-muted-foreground mt-1 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Разместите свой бренд</p>
            </div>
        </Link>
    );
}


export function PartnersDisplay({ partners, tournaments, variant = 'default' }: { partners: Partner[], tournaments: (Tournament | undefined)[], variant?: 'default' | 'compact' }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    const showComponent = partners && partners.length > 0 && tournaments && tournaments.length > 0;

    if (!showComponent) {
        return null;
    }
    
    const containerClasses = variant === 'compact' ? "container pt-0 pb-8" : "container py-8";
    const skeletonClasses = variant === 'compact' ? "h-28 w-44 rounded-xl" : "h-44 w-44 rounded-xl";

    if (!isClient) {
        return (
            <div className={containerClasses}>
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <CarouselItem key={index} className="basis-auto">
                                <Skeleton className={skeletonClasses} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        )
    }

    return (
        <div className={containerClasses}>
            <div className="flex items-center gap-2 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent hidden sm:block" />
                <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-secondary/50 border border-border">
                    <Handshake className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Наши партнеры</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent hidden sm:block" />
            </div>
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                plugins={[
                    Autoplay({
                        delay: 3000,
                        stopOnInteraction: true,
                        stopOnMouseEnter: true,
                    }),
                ]}
                className="w-full"
            >
                <CarouselContent className="-ml-4">
                    {partners.map(partner => (
                         <CarouselItem key={partner.id} className="basis-auto pl-4">
                            <PartnerCard partner={partner} variant={variant} />
                         </CarouselItem>
                    ))}
                    {/* Recruitment slide always at the end */}
                    <CarouselItem className="basis-auto pl-4">
                        <RecruitmentCard variant={variant} />
                    </CarouselItem>
                </CarouselContent>
            </Carousel>
        </div>
    );
}