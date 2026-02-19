'use client';

import { Target, Globe, Zap, ExternalLink, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const checkouts = [
  { text: '170 CHECKOUT: T20, T20, BULLSEYE — "THE BIG FISH"!' },
  { text: '167 CHECKOUT: T20, T19, BULLSEYE — PDC MASTERCLASS!' },
  { text: '164 CHECKOUT: T20, T18, BULLSEYE — SURGICAL FINISH.' },
  { text: '161 CHECKOUT: T20, T17, BULLSEYE — PURE PRECISION.' },
  { text: '160 CHECKOUT: T20, T20, D20 — THE CLASSIC STACK.' },
];

const worldEvents = [
  { text: 'PDC NEWS: World Championship 2025 Tickets on Sale', url: 'https://www.pdc.tv/news' },
  { text: 'PDC EVENT: Premier League Finals — London O2 Arena', url: 'https://www.pdc.tv/news' },
  { text: 'PDC RANKING: New Order of Merit Update Released', url: 'https://www.pdc.tv/news' },
];

export function DartsMarquee() {
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    // Set initial "last update" time
    const updateTime = () => {
        setLastUpdate(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
    };
    
    updateTime();
    
    // Update timestamp every minute to simulate live sync from PDC
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-black/80 border-y border-primary/20 backdrop-blur-md overflow-hidden py-1.5 group">
      <div className="flex whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused]">
        {/* Double groups for seamless looping */}
        {[...Array(4)].map((_, groupIndex) => (
          <div key={groupIndex} className="flex items-center">
            {/* Main Section: High Checkouts */}
            {checkouts.map((item, i) => (
              <div key={`checkout-${i}`} className="flex items-center gap-3 px-6 md:px-8 border-r border-white/5">
                <div className="relative">
                    <Target className="h-4 w-4 text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" />
                    <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 bg-red-500 rounded-full animate-ping" />
                </div>
                <span className="text-[10px] md:text-xs font-black text-white/90 tracking-[0.15em] uppercase">
                  {item.text}
                </span>
                <Zap className="h-2.5 w-2.5 text-yellow-400 animate-pulse opacity-60" />
              </div>
            ))}
            
            {/* News Section: Alternating World Events */}
            {worldEvents.map((event, i) => (
              <div key={`event-${i}`} className="flex items-center gap-4 px-6 md:px-8 border-r border-white/5 bg-primary/5">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                    <Globe className="h-3 w-3 text-accent" />
                    <span className="text-[9px] font-black text-accent uppercase tracking-tighter">PDC LIVE</span>
                </div>
                <a 
                  href={event.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[10px] md:text-xs font-bold text-muted-foreground hover:text-white transition-all tracking-[0.02em] flex items-center gap-1.5 group/link"
                >
                  {event.text}
                  <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover/link:opacity-100 transition-opacity text-accent" />
                </a>
                <div className="flex items-center gap-1 opacity-20">
                    <Timer className="h-2.5 w-2.5" />
                    <span className="text-[8px] font-mono">{lastUpdate}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
