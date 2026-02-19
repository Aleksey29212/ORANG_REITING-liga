'use client';

import { useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { exportAllRankingsAction } from '@/app/actions';

export function ExportButton() {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleExport = () => {
        startTransition(async () => {
            const result = await exportAllRankingsAction();

            if (result.success && result.csv) {
                try {
                    // Add BOM for Excel to recognize UTF-8
                    const blob = new Blob(['\uFEFF' + result.csv], { type: 'text/csv;charset=utf-8;' });
                    
                    const link = document.createElement("a");
                    const url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);

                    const date = new Date().toISOString().split('T')[0];
                    link.setAttribute("download", `dartbrig_pro_rankings_${date}.csv`);
                    
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    toast({
                        title: 'Успешно',
                        description: 'Экспорт рейтинга в CSV начался.',
                    });
                } catch(e: any) {
                     toast({
                        title: 'Ошибка',
                        description: 'Не удалось создать файл для загрузки.',
                        variant: 'destructive',
                    });
                }
            } else {
                 toast({
                    title: 'Ошибка',
                    description: result.message || 'Не удалось сгенерировать данные для экспорта.',
                    variant: 'destructive',
                });
            }
        });
    };

    return (
        <Button onClick={handleExport} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Download />}
            Экспорт в CSV
        </Button>
    )
}
