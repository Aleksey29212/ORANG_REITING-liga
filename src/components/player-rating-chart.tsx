
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { PlayerTournamentHistory } from '@/lib/types';
import { Activity } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useMemo, useState, useEffect } from 'react';

const chartConfig = {
  points: {
    label: 'Очки',
    color: 'hsl(var(--primary))',
  },
};

export function PlayerRatingChart({ tournaments }: { tournaments: PlayerTournamentHistory[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    // We need to reverse the array so the chart shows progression over time
    // and format the date for the X-axis.
    return tournaments
      .slice()
      .reverse()
      .map(t => ({
        date: formatDate(t.tournamentDate as string),
        points: t.playerPoints,
        name: t.tournamentName,
      }));
  }, [tournaments]);

  if (tournaments.length < 2) {
    return null; // Don't show a chart for one or zero data points
  }

  return (
    <Card className="glassmorphism">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="text-primary"/>
            Динамика очков
        </CardTitle>
        <CardDescription>
            Изменение очков, полученных за турнир, с течением времени.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mounted ? (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  domain={['dataMin - 10', 'dataMax + 10']}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value, name, props) => (
                      <div>
                        <p className="font-bold">{props.payload.name}</p>
                        <p>{`${value} очков (${props.payload.date})`}</p>
                      </div>
                    )}
                    labelClassName="text-sm"
                    indicator="dot"
                  />
                }
              />
              <defs>
                  <linearGradient id="fillPoints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                  </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="points"
                stroke="hsl(var(--primary))"
                fill="url(#fillPoints)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="h-[200px] w-full flex items-center justify-center text-muted-foreground italic text-sm">
            Загрузка графика...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
