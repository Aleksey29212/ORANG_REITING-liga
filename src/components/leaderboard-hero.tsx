'use client';

import type { Player } from '@/lib/types';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Crown, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardHeroProps {
  players: Player[];
}

const rankClasses = {
  1: {
    card: 'border-gold shadow-[0_0_30px_theme(colors.gold/0.2)] scale-110 z-20 bg-gradient-to-b from-gold/10 to-card',
    icon: 'text-gold',
    animation: 'transform md:-translate-y-4',
    size: 'basis-[40%] md:w-[35%]',
    avatar: 'h-20 w-20 md:h-28 md:w-28',
    avatarBorder: 'border-gold',
    name: 'text-base md:text-3xl',
    pointsPlaque: 'bg-gold text-black font-black px-3 md:px-6 py-1 md:py-2 rounded-full md:rounded-lg shadow-lg',
  },
  2: {
    card: 'glassmorphism border-silver/50 shadow-[0_0_20px_theme(colors.silver/0.1)] z-10',
    icon: 'text-silver',
    animation: 'transform hover:-translate-y-2',
    size: 'basis-[30%] md:w-1/4',
    avatar: 'h-16 w-16 md:h-24 md:w-24',
    avatarBorder: 'border-silver',
    name: 'text-sm md:text-2xl',
    pointsPlaque: 'bg-silver/20 text-silver font-bold px-2 md:px-4 py-0.5 md:py-1 rounded-full md:rounded-lg shadow-inner',
  },
  3: {
    card: 'glassmorphism border-bronze/50 shadow-[0_0_20px_theme(colors.bronze/0.1)] z-10',
    icon: 'text-bronze',
    animation: 'transform hover:-translate-y-2',
    size: 'basis-[30%] md:w-1/4',
    avatar: 'h-16 w-16 md:h-24 md:w-24',
    avatarBorder: 'border-bronze',
    name: 'text-sm md:text-2xl',
    pointsPlaque: 'bg-bronze/20 text-bronze font-bold px-2 md:px-4 py-0.5 md:py-1 rounded-full md:rounded-lg shadow-inner',
  },
};

function TopPlayerCard({ player }: { player: Player }) {
    const rankStyle = rankClasses[player.rank as keyof typeof rankClasses] || rankClasses[3];

    return (
        <Link href={`/player/${player.id}`} className={cn("transition-all duration-500", rankStyle.size, rankStyle.animation)} prefetch={true}>
            <Card className={cn("text-center h-full flex flex-col justify-between overflow-hidden relative active:scale-95 transition-transform", rankStyle.card)}>
                 {player.rank === 1 && (
                     <div className="absolute top-0 left-0 right-0 h-1 bg-gold animate-pulse" />
                 )}
                 <CardContent className="p-3 md:p-6 flex flex-col items-center justify-center gap-2 md:gap-4">
                    <div className="relative">
                        <Avatar className={cn('border-2 md:border-4 shadow-2xl', rankStyle.avatar, rankStyle.avatarBorder)}>
                            <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint={player.imageHint} />
                            <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                         {player.rank === 1 ? (
                             <Crown className={cn("absolute -top-3 -right-3 h-6 w-6 md:h-10 md:w-10 transform rotate-12 drop-shadow-lg", rankStyle.icon)} strokeWidth={2.5}/>
                         ) : (
                             <div className={cn("absolute -bottom-1 -right-1 h-5 w-5 md:h-8 md:w-8 rounded-full bg-background border-2 flex items-center justify-center shadow-lg", player.rank === 2 ? 'border-silver' : 'border-bronze')}>
                                 <span className={cn("text-[10px] md:text-xs font-black", rankStyle.icon)}>{player.rank}</span>
                             </div>
                         )}
                    </div>
                    <div className="space-y-0.5 md:space-y-1">
                        <h3 className={cn("font-headline uppercase leading-tight truncate w-full max-w-[80px] md:max-w-none", rankStyle.name)}>{player.name.split(' ')[0]}</h3>
                        <p className="text-[8px] md:text-sm text-muted-foreground font-bold uppercase tracking-tighter">&quot;{player.nickname}&quot;</p>
                    </div>
                     <div className={cn("text-xs md:text-2xl font-headline tracking-tighter", rankStyle.pointsPlaque)}>
                        {player.points}
                     </div>
                 </CardContent>
            </Card>
        </Link>
    )
}

export function LeaderboardHero({ players }: LeaderboardHeroProps) {
  if (!players || players.length === 0) {
    return null;
  }
  
  const [p1, p2, p3] = players;
  
  return (
    <div className="w-full space-y-6 md:space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-4xl font-headline text-primary text-glow drop-shadow-2xl uppercase tracking-tighter">Элита Дивизиона</h2>
        <div className="h-1 w-24 bg-primary/30 mx-auto rounded-full" />
      </div>
      
      {/* Podium Layout for both Desktop and Mobile */}
      <div className="flex justify-center items-end gap-1 md:-space-x-4 max-w-3xl mx-auto px-2">
          {p2 && <TopPlayerCard player={p2}/>}
          {p1 && <TopPlayerCard player={p1}/>}
          {p3 && <TopPlayerCard player={p3}/>}
      </div>
    </div>
  );
}
