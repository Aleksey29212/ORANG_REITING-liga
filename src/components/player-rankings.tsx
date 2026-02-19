'use client';

import type { Player, SponsorshipSettings } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TrendingUp, Info, Target, Star, Activity, Award, ChevronRight, Zap, Handshake, Sparkles, MessageCircle, Send } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';

interface PlayerRankingsProps {
  players: Player[];
}

function MobileRankings({ players }: { players: Player[] }) {
    const db = useFirestore();
    const sponsorSettingsRef = useMemoFirebase(() => db ? doc(db, 'app_settings', 'sponsorship') : null, [db]);
    const { data: globalSponsorSettings } = useDoc<SponsorshipSettings>(sponsorSettingsRef);

    return (
        <Accordion type="single" collapsible className="w-full space-y-4 p-1">
            {players.map((player) => {
                const top8Rate = player.matchesPlayed > 0 ? ((player.wins / player.matchesPlayed) * 100).toFixed(1) : '0.0';
                const isTop3 = player.rank > 0 && player.rank <= 3;
                
                // Sponsorship logic
                const hasSponsor = !!player.sponsorName;
                const showRecruitmentCta = !hasSponsor && globalSponsorSettings?.showGlobalSponsorCta !== false && player.showSponsorCta !== false;

                return (
                    <AccordionItem 
                        key={player.id} 
                        value={player.id} 
                        className={cn(
                            "border-2 rounded-2xl bg-card/40 backdrop-blur-sm shadow-xl overflow-hidden transition-all duration-500 data-[state=open]:border-primary/50 data-[state=open]:bg-card/80",
                            isTop3 ? "border-primary/20" : "border-border/30"
                        )}
                    >
                        <div className="flex items-stretch min-h-[80px]">
                            <Link 
                                href={`/player/${player.id}`} 
                                prefetch={true}
                                className="flex-grow flex items-center gap-4 py-4 px-4 active:bg-primary/5 transition-colors"
                            >
                                <div className="flex flex-col items-center justify-center w-10 shrink-0">
                                    <span className={cn(
                                        "font-headline text-2xl leading-none",
                                        player.rank === 1 ? "text-gold text-glow" : 
                                        player.rank === 2 ? "text-silver" : 
                                        player.rank === 3 ? "text-bronze" : "text-muted-foreground/40"
                                    )}>
                                        {player.rank > 0 ? player.rank : '-'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 flex-grow">
                                    <div className="relative">
                                        <Avatar className={cn(
                                            "h-14 w-14 border-2 shadow-xl transition-transform duration-500",
                                            isTop3 ? "border-primary/40 scale-105" : "border-border/50"
                                        )}>
                                            <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint={player.imageHint} />
                                            <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {player.rank > 0 && player.rank <= 3 && (
                                            <div className={cn(
                                                "absolute -top-1 -right-1 h-5 w-5 rounded-full border-2 border-background flex items-center justify-center shadow-lg",
                                                player.rank === 1 ? "bg-gold" : player.rank === 2 ? "bg-silver" : "bg-bronze"
                                            )}>
                                                <Zap className="h-3 w-3 text-black fill-current" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-black text-base leading-tight tracking-tight text-foreground truncate">{player.name}</span>
                                        <div className="flex items-center gap-1.5">
                                            <Badge variant="outline" className="text-[8px] px-1.5 py-0 border-primary/20 text-muted-foreground uppercase font-black tracking-widest">{player.nickname}</Badge>
                                            {hasSponsor && <Handshake className="h-3 w-3 text-primary animate-pulse" />}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-0.5 shrink-0 px-2">
                                    <span className="text-2xl font-headline font-black text-primary text-glow leading-none tracking-tighter">{player.points}</span>
                                    <p className="text-[7px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">БАЛЛОВ</p>
                                </div>
                            </Link>

                            <AccordionTrigger className="w-14 flex items-center justify-center border-l border-border/10 hover:bg-primary/5 transition-colors p-0 [&[data-state=open]>svg]:rotate-180">
                                <div className="bg-muted/30 p-1.5 rounded-full">
                                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-500" />
                                </div>
                                <span className="sr-only">Раскрыть детали</span>
                            </AccordionTrigger>
                        </div>

                        <AccordionContent className="px-4 pb-5 pt-3 border-t border-border/10 bg-gradient-to-b from-primary/[0.03] to-transparent animate-in slide-in-from-top-4 duration-500">
                            {/* Sponsorship Block in Rankings */}
                            {(hasSponsor || showRecruitmentCta) && (
                                <div className="mb-5">
                                    {hasSponsor ? (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                                            <div className="h-8 w-8 relative flex-shrink-0 bg-white p-1 rounded-lg border border-primary/10">
                                                {player.sponsorLogoUrl ? (
                                                    <Image src={player.sponsorLogoUrl} alt={player.sponsorName!} fill className="object-contain" />
                                                ) : (
                                                    <Handshake className="h-full w-full text-primary" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[7px] font-black uppercase tracking-widest text-primary leading-none mb-1">Партнер игрока</p>
                                                <p className="font-headline text-xs uppercase truncate">{player.sponsorName}</p>
                                            </div>
                                            {player.sponsorLink && (
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" asChild>
                                                    <a href={player.sponsorLink} target="_blank" rel="noopener noreferrer">
                                                        <ChevronRight className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-accent/5 border border-dashed border-accent/30 animate-in fade-in zoom-in duration-700">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-accent/20 text-accent">
                                                    <Sparkles className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[7px] font-black uppercase tracking-widest text-accent leading-none mb-1">Стать спонсором</p>
                                                    <p className="text-[10px] font-medium text-foreground/80">{player.sponsorCtaText || "Поддержите игрока!"}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <Button size="icon" variant="outline" className="h-7 w-7 rounded-lg border-accent/30 text-accent" asChild>
                                                    <a href={globalSponsorSettings?.adminTelegramLink} target="_blank" rel="noopener noreferrer">
                                                        <MessageCircle className="h-3.5 w-3.5" />
                                                    </a>
                                                </Button>
                                                <Button size="icon" className="h-7 w-7 rounded-lg bg-accent text-accent-foreground" asChild>
                                                    <a href={globalSponsorSettings?.adminVkLink} target="_blank" rel="noopener noreferrer">
                                                        <Send className="h-3.5 w-3.5" />
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <div className="bg-background/40 border border-border/40 p-3 rounded-2xl flex items-center gap-3 shadow-inner">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <Target className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase text-muted-foreground/70 leading-none mb-1 tracking-widest">Основные</p>
                                        <p className="font-headline text-base text-foreground">{player.basePoints}</p>
                                    </div>
                                </div>
                                <div className="bg-background/40 border border-border/40 p-3 rounded-2xl flex items-center gap-3 shadow-inner">
                                    <div className="p-2 rounded-xl bg-success/10 text-success">
                                        <Star className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase text-muted-foreground/70 leading-none mb-1 tracking-widest">Бонусы</p>
                                        <p className="font-headline text-base text-success">+{player.bonusPoints}</p>
                                    </div>
                                </div>
                                <div className="bg-background/40 border border-border/40 p-3 rounded-2xl flex items-center gap-3 shadow-inner">
                                    <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                                        <Activity className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase text-muted-foreground/70 leading-none mb-1 tracking-widest">Турниры</p>
                                        <p className="font-headline text-base text-foreground">{player.matchesPlayed}</p>
                                    </div>
                                </div>
                                <div className="bg-background/40 border border-border/40 p-3 rounded-2xl flex items-center gap-3 shadow-inner">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <Award className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase text-muted-foreground/70 leading-none mb-1 tracking-widest">ТОП-8</p>
                                        <p className="font-headline text-base text-primary">{player.wins}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <div className="flex-1 bg-primary/5 border border-primary/10 p-3 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                        <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Эффективность:</span>
                                    </div>
                                    <span className="font-headline text-primary text-lg">{top8Rate}%</span>
                                </div>
                                <Button asChild size="sm" className="rounded-2xl px-6 h-auto py-3 shadow-xl shadow-primary/20 font-headline uppercase tracking-tighter text-[10px]">
                                    <Link href={`/player/${player.id}`} prefetch={true}>
                                        ПРОФИЛЬ <ChevronRight className="ml-1 h-3 w-3" />
                                    </Link>
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )
            })}
        </Accordion>
    );
}

export function PlayerRankings({ players }: PlayerRankingsProps) {
  const isMobile = useIsMobile();

  return (
    <Card className="glassmorphism overflow-hidden border-2 border-primary/5 shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between border-b border-primary/10 bg-gradient-to-r from-muted/50 to-transparent">
        <div className="space-y-1.5">
          <CardTitle className="text-xl md:text-2xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary text-glow" />
            </div>
            <span className="font-headline uppercase tracking-tighter">Сводный рейтинг</span>
          </CardTitle>
          <CardDescription className="text-[9px] md:text-xs uppercase font-black tracking-[0.2em] text-muted-foreground/60">Боевая статистика всех турниров</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isMobile ? (
            <MobileRankings players={players} />
        ) : (
            <TooltipProvider>
            <Table>
                <TableHeader>
                <TableRow className="border-border bg-muted/20">
                    <TableHead className="w-[80px] text-center font-bold">№</TableHead>
                    <TableHead className="font-bold">Игрок</TableHead>
                    <TableHead className="text-right">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="flex items-center justify-end gap-1 cursor-help font-bold text-primary">
                                    Всего <Info className="h-3 w-3" />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Сумма основных и бонусных очков.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TableHead>
                    <TableHead className="text-right font-medium">Основные</TableHead>
                    <TableHead className="text-right font-medium text-success">Бонусы</TableHead>
                    <TableHead className="text-right font-medium">Матчи</TableHead>
                    <TableHead className="text-right font-medium">ТОП-8</TableHead>
                    <TableHead className="text-right font-medium text-destructive">Вне ТОП-8</TableHead>
                    <TableHead className="text-right font-medium">ТОП-8 %</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {players.map((player) => {
                    const bonusPoints = player.bonusPoints || 0;
                    const basePoints = player.basePoints || 0;
                    const top8Rate = player.matchesPlayed > 0 ? ((player.wins / player.matchesPlayed) * 100).toFixed(1) : '0.0';
                    return (
                    <TableRow key={player.id} className="even:bg-secondary/30 border-border group transition-colors hover:bg-primary/5">
                        <TableCell className="text-center align-middle font-headline text-lg text-muted-foreground/50 group-hover:text-primary transition-colors">
                            {player.rank > 0 ? player.rank : '-'}
                        </TableCell>
                        <TableCell>
                        <Link href={`/player/${player.id}`} prefetch={true} className="flex items-center gap-4 group/item">
                            <Avatar className="border-2 border-transparent group-hover/item:border-primary transition-all duration-300 shadow-sm">
                                <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint={player.imageHint} />
                                <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-bold tracking-tight text-foreground group-hover/item:text-primary transition-colors">{player.name}</span>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="font-normal w-fit mt-0.5 text-[10px] uppercase tracking-tighter">{player.nickname}</Badge>
                                    {player.sponsorName && <Handshake className="h-3.5 w-3.5 text-primary" title={`Спонсор: ${player.sponsorName}`} />}
                                </div>
                            </div>
                        </Link>
                        </TableCell>
                        <TableCell className="text-right font-mono font-black text-primary text-glow text-lg">{player.points}</TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground font-medium">{basePoints}</TableCell>
                        <TableCell className="text-right text-success font-mono font-bold">+{bonusPoints}</TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">{player.matchesPlayed}</TableCell>
                        <TableCell className="text-right text-primary font-mono font-bold">{player.wins}</TableCell>
                        <TableCell className="text-right text-destructive/60 font-mono">{player.losses}</TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground text-xs font-bold">{top8Rate}%</TableCell>
                    </TableRow>
                    )
                })}
                </TableBody>
            </Table>
            </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
