'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, Trophy, TrendingUp, Handshake, Target, Smartphone, Monitor } from 'lucide-react';
import { useAdmin } from '@/context/admin-context';
import { useIsClient } from '@/hooks/use-is-client';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ScoringHelpDialog } from './scoring-help-dialog';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { ScoringSettings, AllLeagueSettings } from '@/lib/types';
import { useMobileControl } from '@/hooks/use-mobile';

export default function Header() {
  const { isAdmin, logout } = useAdmin();
  const isClient = useIsClient();
  const pathname = usePathname();
  const db = useFirestore();
  const { isForcedMobile, setIsForcedMobile } = useMobileControl();

  // Fetch general settings for the global help on the logo
  const generalScoringRef = useMemoFirebase(() => db ? doc(db, 'scoring_configurations', 'general') : null, [db]);
  const { data: generalSettings } = useDoc<ScoringSettings>(generalScoringRef);

  const leagueSettingsRef = useMemoFirebase(() => db ? doc(db, 'app_settings', 'leagues') : null, [db]);
  const { data: leagueSettings } = useDoc<AllLeagueSettings>(leagueSettingsRef);

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-primary/50 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2">
          {generalSettings ? (
            <ScoringHelpDialog 
              settings={generalSettings} 
              leagueName={leagueSettings?.general.name || 'Общий рейтинг'}
            >
              <button 
                className="flex items-center justify-center p-1 hover:bg-primary/10 rounded-full transition-all duration-300 transform active:scale-95 group" 
                aria-label="Открыть справку по начислению баллов"
              >
                <Target className="h-8 w-8 text-primary drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_12px_hsl(var(--primary))]" />
              </button>
            </ScoringHelpDialog>
          ) : (
            <Target className="h-8 w-8 text-primary" />
          )}
          
          <Link href="/" aria-label="Home" className="flex items-center hover:opacity-80 transition-opacity">
            <span className="text-2xl md:text-3xl font-headline tracking-tighter">DartBrig Pro</span>
          </Link>
        </div>

        <nav className="ml-auto flex items-center gap-2">
          {/* Main Mobile Toggle - Compact Device Selector */}
          <Button 
            variant={isForcedMobile ? "default" : "outline"} 
            size="sm" 
            onClick={() => setIsForcedMobile(!isForcedMobile)}
            title={isForcedMobile ? "Вернуться к ПК версии" : "Переключить в мобильный вид"}
            className={cn(
                "hidden sm:flex h-9 px-3 gap-2 rounded-full border-primary/20 transition-all duration-300",
                isForcedMobile ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-transparent text-muted-foreground hover:text-primary hover:border-primary/50"
            )}
          >
            {isForcedMobile ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">
              {isForcedMobile ? "Мобильный" : "ПК Версия"}
            </span>
          </Button>

          {/* Icon only for small screens */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsForcedMobile(!isForcedMobile)}
            className={cn(
                "sm:hidden transition-all duration-300",
                isForcedMobile ? "text-primary bg-primary/10" : "text-muted-foreground"
            )}
          >
            {isForcedMobile ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" asChild className={cn(pathname === '/' && 'text-primary')}>
            <Link href="/" prefetch={true}>
              <TrendingUp />
              <span className="hidden sm:inline" suppressHydrationWarning>Рейтинги</span>
            </Link>
          </Button>
           <Button variant="ghost" asChild className={cn(pathname.startsWith('/tournaments') && 'text-primary')}>
            <Link href="/tournaments" prefetch={true}>
              <Trophy />
              <span className="hidden sm:inline" suppressHydrationWarning>Турниры</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className={cn(pathname.startsWith('/partners') && 'text-primary')}>
            <Link href="/partners" prefetch={true}>
              <Handshake />
              <span className="hidden sm:inline" suppressHydrationWarning>Партнеры</span>
            </Link>
          </Button>
          {isClient && isAdmin && (
            <>
              <Button variant="ghost" asChild className={cn(pathname.startsWith('/admin') && 'text-primary')}>
                <Link href="/admin" prefetch={true}>
                  <Shield />
                  <span className="hidden sm:inline" suppressHydrationWarning>Админ</span>
                </Link>
              </Button>
              <Button variant="ghost" onClick={logout}>
                <LogOut />
                <span className="hidden sm:inline" suppressHydrationWarning>Выход</span>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
