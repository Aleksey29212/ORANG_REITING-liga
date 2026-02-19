'use client';

import { useState, useEffect, useRef } from 'react';
import type { LeagueId, Player, AllLeagueSettings, ScoringSettings } from '@/lib/types';
import { LeaderboardHero } from '@/components/leaderboard-hero';
import { PlayerRankings } from '@/components/player-rankings';
import { cn } from '@/lib/utils';
import { Trophy, Shield, Star, Award, Users, Baby, Venus, Timer, Sparkles } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface LeaguePanelsProps {
  enabledLeagues: LeagueId[];
  leagueSettings: AllLeagueSettings;
  rankings: Player[][];
  defaultTab: LeagueId;
  allScoringSettings: Record<LeagueId, ScoringSettings>;
}

const leagueVisuals: Record<string, { icon: React.ElementType; color: string; border: string; bg: string; iconBg: string; text: string }> = {
    general: { icon: Trophy, color: 'text-primary', border: 'border-primary', bg: 'bg-gradient-to-br from-primary/20 to-card', iconBg: 'bg-primary', text: 'text-primary-foreground' },
    premier: { icon: Shield, color: 'text-destructive', border: 'border-destructive', bg: 'bg-gradient-to-br from-destructive/20 to-card', iconBg: 'bg-destructive', text: 'text-destructive-foreground' },
    first: { icon: Award, color: 'text-accent', border: 'border-accent', bg: 'bg-gradient-to-br from-accent/20 to-card', iconBg: 'bg-accent', text: 'text-accent-foreground' },
    cricket: { icon: Star, color: 'text-gold', border: 'border-gold', bg: 'bg-gradient-to-br from-gold/20 to-card', iconBg: 'bg-gold', text: 'text-black' },
    senior: { icon: Users, color: 'text-blue-500', border: 'border-blue-500', bg: 'bg-gradient-to-br from-blue-500/20 to-card', iconBg: 'bg-blue-500', text: 'text-white' },
    youth: { icon: Baby, color: 'text-emerald-500', border: 'border-emerald-500', bg: 'bg-gradient-to-br from-emerald-500/20 to-card', iconBg: 'bg-emerald-500', text: 'text-white' },
    women: { icon: Venus, color: 'text-pink-500', border: 'border-pink-500', bg: 'bg-gradient-to-br from-pink-500/20 to-card', iconBg: 'bg-pink-500', text: 'text-white' },
};


export function LeaguePanels({ enabledLeagues, leagueSettings, rankings, defaultTab, allScoringSettings }: LeaguePanelsProps) {
    const [selectedLeague, setSelectedLeague] = useState(defaultTab);
    const [progress, setProgress] = useState(0);
    const isMobile = useIsMobile();
    const isAutoRotating = useRef(true);
    const rotationInterval = 5000; // 5 seconds
    const progressUpdateInterval = 50; // Update progress bar every 50ms

    useEffect(() => {
        if (!isMobile || !isAutoRotating.current || enabledLeagues.length <= 1) return;

        let startTime = Date.now();
        
        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = (elapsed / rotationInterval) * 100;
            
            if (newProgress >= 100) {
                setProgress(0);
                startTime = Date.now();
                setSelectedLeague((prev) => {
                    const currentIndex = enabledLeagues.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % enabledLeagues.length;
                    return enabledLeagues[nextIndex];
                });
            } else {
                setProgress(newProgress);
            }
        }, progressUpdateInterval);

        return () => {
            clearInterval(timer);
            setProgress(0);
        };
    }, [isMobile, enabledLeagues, selectedLeague]);

    const handleLeagueClick = (leagueId: LeagueId) => {
        setSelectedLeague(leagueId);
        isAutoRotating.current = false; // Stop auto-rotation after user interaction
        setProgress(0);
    };
    
    return (
        <div className="w-full">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
                {enabledLeagues.map(leagueId => {
                    const visual = leagueVisuals[leagueId] || leagueVisuals.general;
                    const Icon = visual.icon;
                    const isSelected = selectedLeague === leagueId;

                    return (
                        <button
                            key={leagueId}
                            onClick={() => handleLeagueClick(leagueId)}
                            className={cn(
                                'p-3 md:p-4 rounded-2xl text-left transition-all duration-500 transform flex items-center gap-3 md:gap-4 group relative overflow-hidden',
                                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary',
                                isSelected 
                                    ? cn('shadow-[0_10px_40px_rgba(0,0,0,0.3)] scale-[1.02] md:scale-105 border-2 z-10', visual.border, visual.bg)
                                    : 'bg-card/40 backdrop-blur-md shadow-lg border border-border/50 hover:-translate-y-1'
                            )}
                        >
                            <div className={cn(
                                'p-2 md:p-3 rounded-xl transition-all duration-500 z-10',
                                isSelected ? cn(visual.iconBg, "shadow-lg shadow-black/20") : 'bg-muted/50 group-hover:bg-muted'
                            )}>
                                <Icon className={cn(
                                    "h-6 w-6 md:h-8 md:w-8 shrink-0 transition-colors",
                                    isSelected ? visual.text : cn('text-muted-foreground', visual.color)
                                )} />
                            </div>
                            <div className="z-10 flex-1 min-w-0">
                                <p className={cn(
                                    "text-[10px] md:text-lg font-headline uppercase tracking-tighter truncate",
                                    isSelected ? "text-foreground" : "text-muted-foreground"
                                )}>{leagueSettings[leagueId].name}</p>
                                <p className="text-[8px] md:text-xs font-black text-muted-foreground/60 flex items-center gap-1 uppercase tracking-widest">
                                    {rankings[enabledLeagues.indexOf(leagueId)].filter(p => p.matchesPlayed > 0).length} ЧЛ.
                                </p>
                            </div>
                            
                            {/* Auto-rotation indicator for mobile */}
                            {isSelected && isMobile && isAutoRotating.current && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/10">
                                    <div 
                                        className="h-full bg-primary shadow-[0_0_10px_hsl(var(--primary))] transition-all duration-75 ease-linear" 
                                        style={{ width: `${progress}%` }} 
                                    />
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>
            
            {isMobile && isAutoRotating.current && enabledLeagues.length > 1 && (
                <div className="flex items-center justify-center gap-2 mb-8 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 w-fit mx-auto shadow-xl shadow-primary/5 animate-pulse">
                    <Sparkles className="h-3 w-3 text-primary animate-spin-slow" />
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Авто-обзор активен</span>
                </div>
            )}

            <div className="mt-6 space-y-12">
                {enabledLeagues.map((leagueId, index) => {
                    if (selectedLeague !== leagueId) return null;
                    const players = rankings[index];
                    const activePlayers = players.filter(p => p.matchesPlayed > 0);
                    const topPlayers = activePlayers.filter(p => p.rank > 0 && p.rank <= 3).sort((a,b) => a.rank - b.rank);
                    
                    return (
                        <div key={leagueId} className="animate-in fade-in zoom-in-95 duration-700 space-y-12">
                            {topPlayers.length > 0 && <LeaderboardHero players={topPlayers} />}
                            <div className="pt-4">
                                <PlayerRankings players={activePlayers} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
