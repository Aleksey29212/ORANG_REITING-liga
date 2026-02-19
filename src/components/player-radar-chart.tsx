
'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import type { Player } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';

const chartConfig = {
  value: {
    label: 'Значение',
    color: 'hsl(var(--primary))',
  },
};

const calculateAggregateStats = (player: Player) => {
    const winRate = player.matchesPlayed > 0 ? (player.wins / player.matchesPlayed) * 100 : 0;
    // Power depends on Avg and 180s
    const power = Math.min(100, (Number(player.avg) || 0) + (Number(player.n180s) || 0) * 2);
    // Checkout formula as requested: Hi-out / 1.7
    const finishing = Math.min(100, (Number(player.hiOut) || 0) / 1.7);
    // Experience: 20 tournaments = 100
    const experience = Math.min(100, (Number(player.matchesPlayed) || 0) * 5);
    // Success based on TOP-8 percentage
    const top8Factor = Math.min(100, winRate);
    // Leg quality based on requested formula: 100 * 36 / (x - 9 + 36)
    const legQuality = player.bestLeg > 0 ? (100 * 36) / (player.bestLeg - 9 + 36) : 0;

    return [
        { subject: 'Набор', value: power, fullMark: 100 },
        { subject: 'Опыт', value: experience, fullMark: 100 },
        { subject: 'ТОП-8', value: top8Factor, fullMark: 100 },
        { subject: 'Чекаут', value: finishing, fullMark: 100 },
        { subject: 'Лег', value: legQuality, fullMark: 100 },
    ];
};

const calculateSingleTournamentStats = (player: Player) => {
    const avg = Math.min(100, Number(player.avg));
    const powerScoring = Math.min(100, (Number(player.n180s) || 0) * 25);
    const finishing = Math.min(100, (Number(player.hiOut) || 0) / 1.7); // Apply same formula
    // Leg quality based on requested formula: 100 * 36 / (x - 9 + 36)
    const legQuality = player.bestLeg > 0 ? (100 * 36) / (player.bestLeg - 9 + 36) : 0;

    return [
        { subject: 'Ср. набор', value: avg, fullMark: 100 },
        { subject: '180-ки', value: powerScoring, fullMark: 100 },
        { subject: 'Лег', value: legQuality, fullMark: 100 },
        { subject: 'Чекаут', value: finishing, fullMark: 100 },
    ];
}


export function PlayerRadarChart({ player, viewMode }: { player: Player, viewMode: 'aggregate' | 'single' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const radarData = useMemo(() => {
    if (viewMode === 'single') {
        return calculateSingleTournamentStats(player);
    }
    return calculateAggregateStats(player);
  }, [player, viewMode]);

  if (!mounted) {
    return <div className="mx-auto aspect-square h-[250px] w-full flex items-center justify-center text-muted-foreground italic text-xs">Загрузка...</div>;
  }

  return (
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-[250px] w-full"
      >
        <RadarChart
          data={radarData}
          outerRadius="60%"
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <PolarGrid gridType="polygon" className="stroke-border/50" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 10, fontWeight: 500 }} 
          />
          <Radar
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            strokeWidth={2}
            fillOpacity={0.4}
            dot={{ r: 3, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
          />
        </RadarChart>
      </ChartContainer>
  );
}
