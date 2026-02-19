'use client';

import { useMobileControl } from '@/hooks/use-mobile';
import { Button } from './ui/button';
import { Smartphone, Monitor, Zap, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * A toggle component that allows the user to manually force the mobile view
 * to see the result of mobile-specific features on a desktop.
 */
export function MobileModeToggle() {
    const { isForcedMobile, setIsForcedMobile } = useMobileControl();

    return (
        <div className="flex flex-col items-center justify-center mb-10 gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-2">
                <Layout className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Режим просмотра</span>
            </div>
            
            <div className="flex p-1.5 bg-muted/30 backdrop-blur-md rounded-full border border-primary/10 shadow-2xl">
                <Button 
                    variant={!isForcedMobile ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => setIsForcedMobile(false)}
                    className={cn(
                        "rounded-full gap-2 px-5 h-9 text-[10px] uppercase font-black tracking-widest transition-all",
                        !isForcedMobile ? "shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Monitor className="h-4 w-4" />
                    ПК Версия
                </Button>
                
                <Button 
                    variant={isForcedMobile ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => setIsForcedMobile(true)}
                    className={cn(
                        "rounded-full gap-2 px-5 h-9 text-[10px] uppercase font-black tracking-widest transition-all",
                        isForcedMobile ? "shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Smartphone className="h-4 w-4" />
                    Мобильный
                    {isForcedMobile && <Zap className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />}
                </Button>
            </div>
            
            {isForcedMobile && (
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 animate-in zoom-in-95 duration-300">
                    <Zap className="h-3 w-3 text-primary" />
                    <p className="text-[9px] text-primary font-black uppercase tracking-widest">
                        Включен «Эффект Книги» и Авто-ротация лиг
                    </p>
                </div>
            )}
        </div>
    );
}
