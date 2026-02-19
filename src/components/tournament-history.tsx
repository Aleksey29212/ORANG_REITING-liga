'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PlayerTournamentHistory } from '@/lib/types';
import { History, Medal } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


export function TournamentHistory({ tournaments }: { tournaments: PlayerTournamentHistory[] }) {
  if (tournaments.length === 0) {
    return (
        <Card className="glassmorphism">
             <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <History className="text-primary"/>
                    История выступлений
                </CardTitle>
                <CardDescription>
                    У этого игрока пока нет истории матчей.
                </CardDescription>
            </CardHeader>
        </Card>
    );
  }

  return (
    <Card className="glassmorphism">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
            <History className="text-primary"/>
            История матчей
        </CardTitle>
        <CardDescription>
            Результаты игрока в последних импортированных турнирах.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Турнир / Дата</TableHead>
              <TableHead>Лига</TableHead>
              <TableHead className="text-center">Место</TableHead>
              <TableHead className="text-right">Очки</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments.map((t) => (
              <TableRow key={t.tournamentId}>
                <TableCell>
                  <Link href={`/player/${t.playerId}?tournamentId=${t.tournamentId}`} className="hover:text-primary transition-colors">
                    <p className="font-medium">{t.tournamentName}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(t.tournamentDate as string)}</p>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{t.leagueName}</Badge>
                </TableCell>
                <TableCell className="font-headline text-lg text-center align-middle">
                  <div className="flex items-center justify-center gap-2">
                    {t.playerRank === 1 && <Medal className="text-gold"/>}
                    {t.playerRank === 2 && <Medal className="text-silver"/>}
                    {t.playerRank === 3 && <Medal className="text-bronze"/>}
                    {t.playerRank}
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold text-primary">
                    +{t.playerPoints}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
