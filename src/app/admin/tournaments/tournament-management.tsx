'use client';

import type { Tournament, League } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { deleteTournamentAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Timestamp } from 'firebase/firestore';

function DeleteTournamentButton({ tournamentId, tournamentName }: { tournamentId: string, tournamentName: string }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteTournamentAction(tournamentId);
             if (result.success) {
                toast({
                    title: 'Успешно',
                    description: result.message,
                });
            } else {
                 toast({
                    title: 'Ошибка',
                    description: result.message || 'Не удалось удалить турнир.',
                    variant: 'destructive',
                });
            }
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glassmorphism">
                <AlertDialogHeader>
                    <AlertDialogTitle>Удалить турнир "{tournamentName}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Это действие необратимо. Турнир будет удален, а рейтинги будут пересчитаны.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                        {isPending && <Loader2 className="animate-spin" />}
                        {isPending ? 'Удаление...' : 'Да, удалить'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function TournamentManagement({ tournaments, leagues }: { tournaments: Tournament[], leagues: League[] }) {
    if (tournaments.length === 0) {
        return (
             <Card className="glassmorphism">
                <CardHeader>
                    <CardTitle className="text-xl">Список импортированных турниров</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">Нет импортированных турниров для отображения.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="glassmorphism">
            <CardHeader>
                <CardTitle className="text-xl">Список импортированных турниров</CardTitle>
                 <CardDescription>
                    Здесь вы можете удалить отдельные турниры. Удаление приведет к пересчету рейтингов.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Название турнира</TableHead>
                            <TableHead>Лига</TableHead>
                            <TableHead>Дата</TableHead>
                            <TableHead className="text-right">Удалить</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tournaments.sort((a,b) => {
                            const dateA = a.date instanceof Timestamp ? a.date.toMillis() : new Date(a.date).getTime();
                            const dateB = b.date instanceof Timestamp ? b.date.toMillis() : new Date(b.date).getTime();
                            return dateB - dateA;
                        }).map((tournament) => (
                            <TableRow key={tournament.id}>
                                <TableCell className="font-medium">{tournament.name}</TableCell>
                                <TableCell><Badge variant="secondary">{leagues.find(l => l.id === tournament.league)?.name || tournament.league}</Badge></TableCell>
                                <TableCell>{formatDate(tournament.date as string)}</TableCell>
                                <TableCell className="text-right">
                                    <DeleteTournamentButton tournamentId={tournament.id} tournamentName={tournament.name} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
