'use client';

import type { Player, PlayerProfile, SponsorshipSettings } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useAdmin } from '@/context/admin-context';
import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Save, Edit, X, Info, Zap, Handshake, ExternalLink, Home, Star, Sparkles, MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlayerRadarChart } from './player-radar-chart';
import type { TemplateId } from './template-switcher';
import { cn } from '@/lib/utils';
import { useIsClient } from '@/hooks/use-is-client';
import { Skeleton } from './ui/skeleton';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { updatePlayerProfile } from '@/firebase/players';
import { logSponsorClickAction } from '@/app/actions';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface PlayerCardProps {
  player: Player;
  template?: TemplateId;
  viewMode: 'aggregate' | 'single';
}

const StatItem = ({ label, value, name, template = 'classic', description }: { label: string; value: string | number; name: string, template?: TemplateId, description?: string }) => {
    const baseClasses = "flex flex-col items-center justify-center p-3 rounded-lg gap-1 min-h-[80px] border-2 border-transparent transition-all hover:border-primary/20";
    const templateClasses = {
        classic: "bg-black/20",
        modern: "bg-background",
        dynamic: "bg-black/40 text-white"
    };

    const valueClasses = cn(
        "text-lg md:text-xl font-black font-mono tracking-tighter",
        (name === 'avg' || name === 'n180s' || name === 'hiOut' || name === 'top8Rate') ? 'text-primary text-glow' : 'text-foreground',
        template === 'dynamic' ? 'text-accent' : ''
    );
    
    const content = (
      <div className={cn(baseClasses, templateClasses[template])}>
          <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground flex items-center justify-center gap-1 text-center leading-tight uppercase tracking-widest mb-1">
              {label}
              {description && <Info className="h-2.5 w-2.5 shrink-0 opacity-50" />}
          </p>
          <p className={valueClasses}>{value}</p>
      </div>
    );

    if (description) {
        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <div className="cursor-help w-full">{content}</div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px] text-center glassmorphism">
                    <p className="text-[11px]">{description}</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    return content;
}

const randomSlogans = [
    "Поддержите талант!",
    "Станьте частью команды",
    "Ваш бренд — наш успех",
    "Вместе к вершине!",
    "Инвестируйте в успех",
    "Поддержите стремление к победе",
    "Станьте спонсором мастерства",
    "Развиваем дартс вместе"
];

function SponsorWidget({ player }: { player: PlayerProfile }) {
    const templateId = player.sponsorTemplateId || 'default';
    
    const handleSponsorClick = () => {
        if (player.sponsorName && player.sponsorLink) {
            logSponsorClickAction(player.id, player.name, player.sponsorName);
        }
    };

    if (!player.sponsorName) return null;

    const templates = {
        default: "p-3 md:p-4 rounded-xl border-2 border-primary/10 bg-primary/[0.03] backdrop-blur-sm shadow-lg",
        neon: "p-3 md:p-4 rounded-xl border-2 border-primary/40 bg-black/40 shadow-[0_0_20px_hsl(var(--primary)/0.2)] led-glow",
        premium: "p-3 md:p-4 rounded-xl border-2 border-gold/30 bg-gradient-to-br from-gold/10 to-transparent shadow-xl",
        minimal: "p-2 md:p-3 rounded-lg border border-primary/5 bg-transparent",
        banner: "p-4 md:p-5 rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20",
    };

    const logoWrappers = {
        default: "bg-white p-1.5 rounded-xl shadow-inner border border-primary/10",
        neon: "bg-white p-1 rounded-lg border-2 border-primary/50 shadow-[0_0_10px_hsl(var(--primary)/0.5)]",
        premium: "bg-white p-2 rounded-full border-2 border-gold shadow-lg scale-110 md:scale-125",
        minimal: "bg-white p-1 rounded-md",
        banner: "bg-white p-1.5 rounded-xl shadow-lg",
    };

    const textStyles = {
        default: "text-primary/60",
        neon: "text-primary font-black animate-pulse",
        premium: "text-gold font-serif italic",
        minimal: "text-muted-foreground",
        banner: "text-primary-foreground/80",
    };

    const nameStyles = {
        default: "text-foreground",
        neon: "text-white text-glow",
        premium: "text-gold font-bold tracking-widest",
        minimal: "text-foreground text-xs",
        banner: "text-primary-foreground font-black text-xl",
    };

    const currentTemplate = templates[templateId as keyof typeof templates] || templates.default;
    const logoWrapper = logoWrappers[templateId as keyof typeof logoWrappers] || logoWrappers.default;
    const textStyle = textStyles[templateId as keyof typeof textStyles] || textStyles.default;
    const nameStyle = nameStyles[templateId as keyof typeof nameStyles] || nameStyles.default;

    return (
        <div className={cn("relative group/sponsor overflow-hidden flex items-center gap-4 transition-all duration-500", currentTemplate)}>
            <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                <Handshake className="h-12 w-12" />
            </div>
            
            <div className={cn("relative h-14 w-14 md:h-16 md:w-16 flex-shrink-0 transition-transform duration-300 group-hover/sponsor:scale-105", logoWrapper)}>
                {player.sponsorLogoUrl ? (
                    player.sponsorLink ? (
                        <a href={player.sponsorLink} target="_blank" rel="noopener noreferrer" onClick={handleSponsorClick}>
                            <Image src={player.sponsorLogoUrl} alt={player.sponsorName} fill className="object-contain p-1" />
                        </a>
                    ) : (
                        <Image src={player.sponsorLogoUrl} alt={player.sponsorName} fill className="object-contain p-1" />
                    )
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                        <Handshake className="h-6 w-6 text-primary/40" />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className={cn("text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] mb-0.5", textStyle)}>
                    {templateId === 'premium' ? 'Exclusive Partner' : 'Официальный партнер'}
                </p>
                <h4 className={cn("font-headline text-sm md:text-lg leading-tight uppercase truncate", nameStyle)}>{player.sponsorName}</h4>
                {player.sponsorLink && (
                    <a 
                        href={player.sponsorLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={handleSponsorClick}
                        className={cn(
                            "text-[9px] font-bold hover:underline flex items-center gap-1 mt-1 uppercase tracking-widest",
                            templateId === 'banner' ? 'text-primary-foreground/90' : 'text-primary'
                        )}
                    >
                        {templateId === 'premium' ? 'Visit Boutique' : 'Магазин'} <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                )}
            </div>
        </div>
    );
}

export function PlayerCard({ player, template = 'classic', viewMode }: PlayerCardProps) {
  const { isAdmin, setIsDirty } = useAdmin();
  const db = useFirestore();
  const [isEditing, setIsEditing] = useState(false);
  const [editablePlayer, setEditablePlayer] = useState<PlayerProfile>(player);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const { toast } = useToast();
  const isClient = useIsClient();
  const [randomSlogan, setRandomSlogan] = useState("");

  const sponsorSettingsRef = useMemoFirebase(() => db ? doc(db, 'app_settings', 'sponsorship') : null, [db]);
  const { data: globalSponsorSettings } = useDoc<SponsorshipSettings>(sponsorSettingsRef);

  useEffect(() => {
    setEditablePlayer(player);
  }, [player]);

  useEffect(() => {
    setRandomSlogan(randomSlogans[Math.floor(Math.random() * randomSlogans.length)]);
  }, [player.id]);

  useEffect(() => {
    setIsDirty(isFormDirty);
    return () => setIsDirty(false);
  }, [isFormDirty, setIsDirty]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditablePlayer(prev => ({ ...prev, [name]: value }));
    setIsFormDirty(true);
  };
  
  const handleSave = async () => {
    if (!db) return;
    updatePlayerProfile(db, editablePlayer);
    toast({ title: 'Обновление', description: `Изменения сохраняются...` });
    setIsFormDirty(false);
    setIsEditing(false);
  }

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditablePlayer(player);
    setIsFormDirty(false);
  };

  const currentPlayerData = isEditing ? editablePlayer : player;
  // Default background is Template #1 (Classical Target)
  const backgroundImageUrl = currentPlayerData.backgroundUrl || `https://images.unsplash.com/photo-1544098485-2a216e2133c1`;
  
  const showRecruitmentCta = !currentPlayerData.sponsorName && globalSponsorSettings?.showGlobalSponsorCta !== false && currentPlayerData.showSponsorCta !== false;

  const adminControls = (
     <div className='my-6 px-4 md:px-0'>
        {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className='w-full border-2 border-dashed bg-transparent hover:bg-primary/5 hover:border-primary transition-all py-6'><Edit className="mr-2 h-4 w-4"/>Редактировать профиль</Button>
        ) : (
            <div className="space-y-4 p-6 border-2 rounded-xl glassmorphism max-h-[70vh] overflow-y-auto shadow-2xl">
                 <h3 className="font-headline text-lg uppercase text-primary">Режим редактирования</h3>
                 <div className="space-y-2">
                    <Label htmlFor="nickname">Никнейм</Label>
                    <Input id="nickname" name="nickname" value={editablePlayer.nickname} onChange={handleInputChange} className="font-medium" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="bio">Биография</Label>
                    <Textarea id="bio" name="bio" value={editablePlayer.bio} onChange={handleInputChange} className="min-h-[100px]" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="backgroundUrl">URL фона карточки</Label>
                    <Input id="backgroundUrl" name="backgroundUrl" value={editablePlayer.backgroundUrl || ''} onChange={handleInputChange} placeholder="https://..." />
                </div>
                <div className="pt-4 border-t-2 border-primary/10 space-y-4">
                    <h4 className="font-headline text-xs uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <Handshake className="h-3 w-3" />
                        Спонсорство игрока
                    </h4>
                    <div className="space-y-2">
                        <Label htmlFor="sponsorName">Название бренда</Label>
                        <Input id="sponsorName" name="sponsorName" value={editablePlayer.sponsorName || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sponsorLogoUrl">URL логотипа</Label>
                        <Input id="sponsorLogoUrl" name="sponsorLogoUrl" value={editablePlayer.sponsorLogoUrl || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sponsorLink">Ссылка на сайт</Label>
                        <Input id="sponsorLink" name="sponsorLink" value={editablePlayer.sponsorLink || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sponsorTemplateId">Шаблон размещения</Label>
                        <Select value={editablePlayer.sponsorTemplateId || 'default'} onValueChange={(val: any) => { setEditablePlayer(prev => ({...prev, sponsorTemplateId: val})); setIsFormDirty(true); }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите стиль" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Классическое стекло</SelectItem>
                                <SelectItem value="neon">Неоновый акцент</SelectItem>
                                <SelectItem value="premium">Золотой премиум</SelectItem>
                                <SelectItem value="minimal">Минимализм</SelectItem>
                                <SelectItem value="banner">Яркий баннер</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex gap-2 sticky bottom-0 bg-background/95 backdrop-blur pt-4 border-t">
                    <Button onClick={handleSave} className='flex-1'><Save className="mr-2 h-4 w-4"/>Сохранить</Button>
                    <Button onClick={handleCancelEditing} className='flex-1' variant="destructive"><X className="mr-2 h-4 w-4"/>Отмена</Button>
                </div>
            </div>
        )}
    </div>
  );

  return (
    <TooltipProvider>
    <Card className={cn(
        "glassmorphism overflow-hidden transition-all duration-500 border-2",
        template === 'modern' && 'flex flex-col md:flex-row',
        template === 'dynamic' && 'border-accent shadow-2xl shadow-accent/20'
    )}>
        {/* Header & Collectible Background Underlay */}
        <div className={cn(
            "relative overflow-hidden",
            template === 'classic' && "h-56 md:h-64",
            template === 'modern' && "p-8 md:w-1/3 flex flex-col items-center justify-center border-r-2 border-primary/10",
            template === 'dynamic' && "h-64 md:h-72"
        )}>
            {/* The "Podlozhka" - Primary background layer */}
            <div className="absolute inset-0 bg-black/40 z-0" />
            <Image 
                src={backgroundImageUrl}
                alt={`${currentPlayerData.name} collectible underlay`}
                fill
                className={cn(
                    "object-cover transition-all duration-1000 scale-110 group-hover:scale-100",
                    template === 'classic' && "opacity-60",
                    template === 'modern' && "opacity-0",
                    template === 'dynamic' && "opacity-70 brightness-[0.5]"
                )}
                unoptimized={backgroundImageUrl.startsWith('https://images.unsplash.com') || backgroundImageUrl.startsWith('data:image')}
                priority
            />
            {/* Soft Overlay for readability */}
             <div className={cn(
                "absolute inset-0 z-[1]",
                template === 'classic' && "bg-gradient-to-t from-card via-card/60 to-transparent",
                template === 'modern' && "",
                template === 'dynamic' && "bg-gradient-to-t from-background via-background/80 to-transparent"
             )} />

            {/* Content atop the underlay */}
            <div className={cn(
                "absolute transition-all duration-500 ease-out p-6 md:p-8 z-[2]",
                template === 'classic' && "bottom-0 left-0 flex items-center md:items-end gap-4 md:gap-6",
                template === 'modern' && "relative flex flex-col items-center gap-6",
                template === 'dynamic' && "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
            )}>
                <Avatar className={cn(
                    "transition-all duration-500 shadow-2xl",
                    template === 'classic' && "h-24 w-24 md:h-32 md:w-32 border-4 border-primary ring-8 ring-primary/10",
                    template === 'modern' && "h-32 w-32 md:h-40 md:w-40 border-4 border-primary",
                    template === 'dynamic' && "h-32 w-32 md:h-36 md:w-36 border-4 border-accent ring-8 ring-accent/10"
                )}>
                    <AvatarImage src={currentPlayerData.avatarUrl} alt={currentPlayerData.name} className="object-cover" />
                    <AvatarFallback className="text-4xl font-headline">{currentPlayerData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                 <div className={cn(template === 'modern' ? 'text-center' : 'flex flex-col items-start gap-1')}>
                    <h1 className={cn("font-headline text-primary-foreground drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-tight uppercase tracking-tighter", template === 'classic' && "text-3xl md:text-5xl", template !== 'classic' && "text-3xl md:text-4xl")}>{currentPlayerData.name}</h1>
                    <Badge variant="secondary" className="font-bold px-3 py-1 text-[10px] md:text-xs uppercase tracking-widest border border-primary/20 bg-background/80 backdrop-blur-sm">{currentPlayerData.nickname}</Badge>
                </div>
            </div>

            <div className={cn(
                "absolute top-4 right-4 md:top-6 md:right-6 z-[2]",
                template === 'modern' && "top-4 right-4 md:absolute md:top-6 md:right-6"
            )}>
                <div className={cn(
                    "flex flex-col items-center justify-center p-2 md:p-3 rounded-xl md:rounded-2xl backdrop-blur-xl border-2 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform",
                    template === 'dynamic' ? 'border-accent bg-accent/20' : 'border-primary bg-primary/20'
                )}>
                    <span className="text-[8px] md:text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Место</span>
                    <span className={cn("text-2xl md:text-3xl font-headline text-glow leading-none", template === 'dynamic' ? 'text-accent' : 'text-primary')}>
                        #{currentPlayerData.rank > 0 ? currentPlayerData.rank : '-'}
                    </span>
                </div>
            </div>
        </div>

        {/* Content Section */}
        <CardContent className={cn(
            "p-4 md:p-10 transition-all duration-500 relative z-10",
            template === 'modern' && 'md:w-2/3',
            template === 'dynamic' && "pt-20 md:pt-24"
        )}>
             {isClient && isAdmin && adminControls}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="space-y-8 md:space-y-10">
                    
                    {/* Sponsor Section */}
                    {currentPlayerData.sponsorName ? (
                        <SponsorWidget player={currentPlayerData} />
                    ) : (
                        showRecruitmentCta && (
                            <div className="p-3 md:p-4 rounded-xl border-2 border-dashed border-accent/30 bg-accent/[0.03] relative overflow-hidden group/recruit flex items-center justify-between gap-4">
                                <div className="absolute -right-4 -top-4 opacity-10 group-hover/recruit:scale-110 transition-transform duration-700">
                                    <Sparkles className="h-16 w-16 text-accent" />
                                </div>
                                <div className="flex items-center gap-3 relative z-10 flex-1 min-w-0">
                                    <div className="p-2 md:p-2.5 rounded-xl bg-accent/10 text-accent shadow-lg shadow-accent/5 animate-pulse">
                                        <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-headline text-[9px] md:text-[10px] uppercase tracking-[0.1em] text-accent/80 leading-none mb-1.5">Разместить логотип</h4>
                                        <p className="text-[10px] md:text-[12px] font-bold text-foreground truncate italic">
                                            &laquo;{currentPlayerData.sponsorCtaText || randomSlogan}&raquo;
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 relative z-10">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button size="icon" variant="outline" className="h-8 w-8 md:h-9 md:w-9 rounded-xl border-accent/20 text-accent hover:bg-accent/10 hover:border-accent/40 transition-all" asChild>
                                                <a href={globalSponsorSettings?.adminTelegramLink} target="_blank" rel="noopener noreferrer">
                                                    <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
                                                </a>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="glassmorphism">Написать в Telegram</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20" asChild>
                                                <a href={globalSponsorSettings?.adminVkLink} target="_blank" rel="noopener noreferrer">
                                                    <Send className="h-4 w-4 md:h-5 md:w-5" />
                                                </a>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="glassmorphism">Написать во ВКонтакте</TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        )
                    )}

                    <div className="space-y-4">
                        <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-border"></span>
                            Биография
                            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-border"></span>
                        </h3>
                        <p className="text-xs md:text-sm text-foreground/80 leading-relaxed font-medium italic indent-4">{currentPlayerData.bio}</p>
                    </div>
                    
                    <div className="space-y-6">
                        <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-border"></span>
                            Карьера
                            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-border"></span>
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
                            <StatItem template={template} label="Очков" name="points" value={Number(player.points || 0)} description="Суммарный рейтинг" />
                            <StatItem template={template} label="Матчей" name="matchesPlayed" value={Number(player.matchesPlayed || 0)} description="Всего турниров" />
                            <StatItem template={template} label="ТОП-8" name="wins" value={Number(player.wins || 0)} description="Места 1-8" />
                            <StatItem template={template} label="Вне 8" name="losses" value={Number(player.losses || 0)} description="Места 9+" />
                            <StatItem template={template} label="Эффект." name="top8Rate" value={player.matchesPlayed > 0 ? `${((player.wins / player.matchesPlayed) * 100).toFixed(0)}%` : 'N/A'} description="% попадания в ТОП-8" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-border"></span>
                            Рекорды
                            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-border"></span>
                        </h3>
                        <div className="grid grid-cols-3 gap-2 md:gap-4">
                            <StatItem template={template} label="Ср. набор" name="avg" value={Number(player.avg || 0).toFixed(2)} />
                            <StatItem template={template} label="Max (180)" name="n180s" value={Number(player.n180s || 0)} />
                            <StatItem template={template} label="Hi-Out" name="hiOut" value={Number(player.hiOut || 0)} />
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col items-center justify-start gap-6 md:gap-8">
                    <div className="w-full relative">
                        <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />
                        {isClient ? <PlayerRadarChart player={player} viewMode={viewMode} /> : <Skeleton className="mx-auto aspect-square h-[250px] md:h-[300px] rounded-full" />}
                    </div>
                    
                    <div className="w-full p-4 md:p-6 rounded-2xl border-2 border-primary/10 bg-card/50 backdrop-blur space-y-4 shadow-inner">
                        <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                            <Zap className="h-3 w-3" />
                            Методология рейтинга
                        </h4>
                        <div className="grid grid-cols-1 gap-2 md:gap-3 text-[10px] md:text-[11px] leading-relaxed font-medium">
                            <div className="flex justify-between border-b border-primary/5 pb-2">
                                <span className="text-muted-foreground italic">Набор мощности:</span>
                                <span className="text-foreground text-right ml-2 font-bold uppercase">AVG + 180</span>
                            </div>
                            <div className="flex justify-between border-b border-primary/5 pb-2">
                                <span className="text-muted-foreground italic">Чекаут:</span>
                                <span className="text-foreground text-right ml-2 font-bold uppercase">Hi-Out / 1.7</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground italic">Качество лега:</span>
                                <span className="text-foreground text-right ml-2 font-bold uppercase">100 * 36 / (Л-9+36)</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="w-full grid grid-cols-1 gap-3">
                        <Button asChild size="lg" className="w-full rounded-xl shadow-xl shadow-primary/20 font-bold uppercase tracking-widest text-[10px] md:text-xs py-6 md:py-7">
                            <Link href="/">
                                <Home className="mr-3 h-4 w-4 md:h-5 md:w-5" />
                                На главную
                            </Link>
                        </Button>
                        <p className="text-[8px] md:text-[9px] text-center text-muted-foreground uppercase font-black tracking-widest opacity-50">DartBrig Pro v2.5 | 2024</p>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
    </TooltipProvider>
  );
}
