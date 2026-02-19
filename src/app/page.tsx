import { getAllScoringSettings, getLeagueSettings } from '@/lib/settings';
import { getRankings } from '@/lib/leagues';
import type { LeagueId, Player } from '@/lib/types';
import { getTournaments } from '@/lib/tournaments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Shield } from 'lucide-react';
import { unstable_noStore as noStore } from 'next/cache';
import { PlayerSelector } from '@/components/player-selector';
import { getPartners } from '@/lib/partners';
import { PartnersDisplay } from '@/components/partners-display';
import { LeaguePanels } from '@/components/league-panels';
import { DartsMarquee } from '@/components/darts-marquee';

export default async function Home(props: {
  searchParams: Promise<{ league?: LeagueId }>;
}) {
  noStore();
  const searchParams = await props.searchParams;

  const leagueSettings = await getLeagueSettings();
  const tournaments = await getTournaments();
  const partners = await getPartners();
  const allScoringSettings = await getAllScoringSettings();

  // If no tournaments are imported, show a message.
  if (tournaments.length === 0) {
    return (
      <main className="flex-1 container py-8 flex items-center justify-center">
        <Card className="glassmorphism max-w-lg w-full text-center">
          <CardHeader>
            <CardTitle className="font-headline text-4xl text-primary text-glow">Добро пожаловать в DartBrig Pro!</CardTitle>
            <CardDescription className="text-lg">
              Ваша panel управления рейтингами готова к работе.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-muted-foreground">
              Для начала работы войдите в панель администратора, чтобы импортировать турниры и настроить систему.
            </p>
            <Button asChild size="lg">
              <Link href="/admin">
                <Shield className="mr-2" />
                Перейти в панель администратора
                <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const enabledLeagues = (Object.keys(leagueSettings) as LeagueId[]).filter(key => leagueSettings[key].enabled);
  const defaultTab = searchParams?.league && enabledLeagues.includes(searchParams.league) ? searchParams.league : enabledLeagues[0] || 'general';

  const rankings = await Promise.all(
    enabledLeagues.map(leagueId => getRankings(leagueId))
  );

  const allActivePlayers = rankings
    .flat()
    .filter(p => p.matchesPlayed > 0)
    .filter((p, index, self) => index === self.findIndex(t => t.id === p.id));

  return (
    <main className="flex-1 flex flex-col min-h-screen">
       <DartsMarquee />
       
       <div className="container py-8 space-y-8">
          <PartnersDisplay partners={partners} tournaments={tournaments} variant="compact" />
          
          <div className="my-4">
            <PlayerSelector players={allActivePlayers}/>
          </div>

          <LeaguePanels 
              enabledLeagues={enabledLeagues}
              leagueSettings={leagueSettings}
              rankings={rankings}
              defaultTab={defaultTab}
              allScoringSettings={allScoringSettings}
          />
       </div>
    </main>
  );
}
