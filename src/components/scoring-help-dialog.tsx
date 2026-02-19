'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Sparkles, Info } from 'lucide-react';
import type { ScoringSettings } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

interface ScoringHelpDialogProps {
  settings: ScoringSettings;
  leagueName: string;
  variant?: 'default' | 'logo';
  children?: ReactNode;
}

export function ScoringHelpDialog({ settings, leagueName, variant = 'default', children }: ScoringHelpDialogProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to build the dynamic help text
  const buildHelpText = () => {
    const sections = [];

    sections.push({
      title: 'Приоритет в рейтинге',
      content: 'При равенстве очков, место игрока определяется по следующим критериям:\n1. Основные очки.\n2. Средний набор (AVG).\n3. Количество "побед" (ТОП-8).\n4. Количество сыгранных матчей.',
    });

    const basePointsDescription = [
      `1-е место: ${settings.pointsFor1st} очков`,
      `2-е место: ${settings.pointsFor2nd} очков`,
      `3-4 места: ${settings.pointsFor3rd_4th} очков`,
      `5-8 места: ${settings.pointsFor5th_8th} очков`,
      `9-16 места: ${settings.pointsFor9th_16th} очков`,
      `Остальные: ${settings.participationPoints} очков`,
    ].join('\n');
    sections.push({
      title: 'Основные очки за место',
      content: basePointsDescription,
    });

    const activeBonuses = [];
    if (settings.enable180Bonus && settings.bonusPer180 > 0) {
      activeBonuses.push(`- За каждый "максимум" (180): +${settings.bonusPer180} очков.`);
    }
    if (settings.enableHiOutBonus && settings.hiOutBonus > 0) {
      activeBonuses.push(`- За чекаут ${settings.hiOutThreshold} и выше: +${settings.hiOutBonus} очков.`);
    }
    if (settings.enableAvgBonus && settings.avgBonus > 0) {
      activeBonuses.push(`- За средний набор (AVG) ${settings.avgThreshold} и выше: +${settings.avgBonus} очков.`);
    }
    if (settings.enableShortLegBonus && settings.shortLegBonus > 0) {
      activeBonuses.push(`- За "короткий" лег (≤ ${settings.shortLegThreshold} дротиков): +${settings.shortLegBonus} очков.`);
    }
    if (settings.enable9DarterBonus && settings.bonusFor9Darter > 0) {
        activeBonuses.push(`- За "идеальный" лег (9 дротиков): +${settings.bonusFor9Darter} очков.`);
    }

    if (activeBonuses.length > 0) {
      sections.push({
        title: 'Активные бонусы',
        content: activeBonuses.join('\n'),
      });
    } else {
       sections.push({
        title: 'Активные бонусы',
        content: 'В данный момент для этой лиги не настроено ни одного бонуса за статистику.',
      });
    }

    return sections;
  };

  if (!mounted) {
    return null;
  }

  const helpSections = buildHelpText();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "transition-all duration-300 group",
              variant === 'logo' ? "h-4 w-4 p-0 rounded-full bg-primary/20 hover:bg-primary/40" : "h-8 w-8"
            )}
            aria-label="Помощь по системе начисления очков"
          >
            <Info className={cn("text-primary", variant === 'logo' ? 'h-2.5 w-2.5' : 'h-4 w-4')} />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glassmorphism max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="text-primary" />
            Начисление очков: {leagueName}
          </DialogTitle>
          <DialogDescription>
            Рейтинг рассчитывается как сумма основных и бонусных очков за все турниры.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4 my-2">
            <div className="space-y-4">
                {helpSections.map((section, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                        <h4 className="font-semibold text-foreground mb-1">{section.title}</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{section.content}</p>
                    </div>
                ))}
            </div>
        </ScrollArea>
        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Система DartBrig Pro</p>
          </div>
          <div className="text-[9px] text-muted-foreground leading-tight space-y-1">
            <p>разработчик сообщество клуба Федерал _ОРФСФО &quot;Федерация дартс&quot;, Рядченко А. Андякин К.</p>
            <p>тестировщик Онищук С. &quot;брат&quot;</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
