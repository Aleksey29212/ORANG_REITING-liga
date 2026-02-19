'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Player } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { View } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function PlayerSelector({ players }: { players: Player[] }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleViewCard = () => {
    if (selectedPlayerId) {
      router.push(`/player/${selectedPlayerId}`);
    }
  };

  return (
    <Card className="glassmorphism">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Просмотр карточки игрока</CardTitle>
        <CardDescription className="text-base text-foreground/80">
          Выберите игрока из списка, чтобы мгновенно перейти к его подробной статистике и карточке.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        {isClient ? (
            <Select onValueChange={setSelectedPlayerId}>
            <SelectTrigger className="flex-grow">
                <SelectValue placeholder="Выберите игрока..." />
            </SelectTrigger>
            <SelectContent>
                {players.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                    {player.name}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        ) : <Skeleton className="h-10 flex-grow" />}
        <Button onClick={handleViewCard} disabled={!selectedPlayerId}>
          <View />
          Просмотр
        </Button>
      </CardContent>
    </Card>
  );
}
