'use client';

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
import { clearTournamentsAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";

export function ClearTournamentsButton() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleClear = () => {
        startTransition(async () => {
            const result = await clearTournamentsAction();
            if (result.success) {
                toast({
                    title: 'Успешно',
                    description: result.message,
                });
            } else {
                 toast({
                    title: 'Ошибка',
                    description: result.message || 'Не удалось очистить данные.',
                    variant: 'destructive',
                });
            }
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">
                    <Trash2 />
                    Очистить турниры
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glassmorphism">
                <AlertDialogHeader>
                    <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Это действие необратимо. Все данные о турнирах будут удалены. Статистика игроков (очки, матчи, победы, поражения) будет сброшена до нуля. Сами профили игроков останутся.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClear} disabled={isPending}>
                        {isPending && <Loader2 className="animate-spin" />}
                        {isPending ? 'Удаление...' : 'Да, очистить'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
