import { getRankings } from "@/lib/leagues";
import { StyleStudioClient } from "@/components/style-studio";

export default async function StyleStudioPage() {
    const players = await getRankings('general');
    return (
        <StyleStudioClient players={players} />
    );
}
