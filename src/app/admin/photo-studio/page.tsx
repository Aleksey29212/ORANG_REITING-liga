import { getRankings } from "@/lib/leagues";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PhotoUploader } from "@/components/photo-uploader";
import { Camera } from "lucide-react";

export default async function PhotoStudioPage() {
    const players = await getRankings('general');
    return (
        <div className="max-w-2xl mx-auto">
            <Card className="glassmorphism">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Camera className="text-primary"/>
                        Фотостудия
                    </CardTitle>
                    <CardDescription>
                        Загрузите или обновите аватары для игроков. Выберите игрока из списка и загрузите новую фотографию.
                    </CardDescription>
                </CardHeader>
                <PhotoUploader players={players} />
            </Card>
        </div>
    );
}
