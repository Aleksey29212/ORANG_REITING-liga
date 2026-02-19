
'use server';

import { getPlayerProfileById } from '@/lib/players';
import { getTournaments } from '@/lib/tournaments';
import { notFound } from 'next/navigation';
import { PlayerPageClient } from './player-page-client';
import type { Player, PlayerTournamentHistory, ScoringSettings } from '@/lib/types';
import { getRankings } from '@/lib/leagues';
import { Timestamp } from 'firebase/firestore';
import { getLeagueSettings, getScoringSettings } from '@/lib/settings';
import { calculatePlayerPoints } from '@/lib/scoring';

export default async function PlayerPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tournamentId?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const playerId = decodeURIComponent(params.id);
  const tournamentId = searchParams?.tournamentId;

  const basePlayerProfile = await getPlayerProfileById(playerId);
  if (!basePlayerProfile) {
    notFound();
  }

  let playerForCard: Player;
  let tournamentsForHistory: PlayerTournamentHistory[] = [];
  const viewMode: 'aggregate' | 'single' = tournamentId ? 'single' : 'aggregate';
  let pageSubtitle: string | null = null;
  let scoringSettingsForHelp: ScoringSettings;
  let leagueNameForHelp: string;
  
  const allTournaments = await getTournaments();
  const leagueSettings = await getLeagueSettings();

  if (viewMode === 'single') {
    const tournament = allTournaments.find(t => t.id === tournamentId);

    if (!tournament) {
      notFound();
    }
    
    scoringSettingsForHelp = await getScoringSettings(tournament.league);
    leagueNameForHelp = leagueSettings[tournament.league]?.name || tournament.league;

    const playerResultInTournament = tournament.players.find((p) => p.id === playerId);

    if (!playerResultInTournament) {
      const generalRankings = await getRankings('general');
      const foundPlayer = generalRankings.find(p => p.id === playerId);
      if (!foundPlayer) notFound();
      playerForCard = foundPlayer;
      pageSubtitle = 'Общая карьерная статистика (игрок не найден в этом турнире)';
    } else {
      const playerResult = { ...playerResultInTournament }; // Create a mutable copy

      // Recalculate points on the fly for this single tournament view
      const scoringSettings = await getScoringSettings(tournament.league);
      calculatePlayerPoints(playerResult, scoringSettings);
      
      playerForCard = {
        ...basePlayerProfile,
        ...playerResult,
        matchesPlayed: 1,
        wins: playerResult.rank <= 8 ? 1 : 0,
        losses: playerResult.rank > 8 ? 1 : 0,
        totalPointsFor180s: playerResult.pointsFor180s,
        totalPointsForHiOut: playerResult.pointsForHiOut,
        totalPointsForAvg: playerResult.pointsForAvg,
        totalPointsForBestLeg: playerResult.pointsForBestLeg,
        totalPointsFor9Darter: playerResult.pointsFor9Darter,
        rank: playerResult.rank,
      };
      pageSubtitle = `Статистика в турнире: ${tournament.name}`;
    }
  } else {
    // For aggregate view, show general ranking by default
    scoringSettingsForHelp = await getScoringSettings('general');
    leagueNameForHelp = leagueSettings.general.name;
    const generalRankings = await getRankings('general');
    const foundPlayer = generalRankings.find(p => p.id === playerId);
    
    if (!foundPlayer) {
      playerForCard = {
        ...basePlayerProfile,
        rank: 0,
        points: 0,
        basePoints: 0,
        bonusPoints: 0,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        avg: 0,
        n180s: 0,
        hiOut: 0,
        bestLeg: 0,
        totalPointsFor180s: 0,
        totalPointsForHiOut: 0,
        totalPointsForAvg: 0,
        totalPointsForBestLeg: 0,
        totalPointsFor9Darter: 0,
      }
    } else {
        playerForCard = foundPlayer;
    }

    const historyPromises = allTournaments
      .filter(tournament => tournament.players.some(p => p.id === playerId))
      .map(async (tournament) => {
          const playerResult = tournament.players.find((p) => p.id === playerId)!;
          const scoringSettings = await getScoringSettings(tournament.league);
          
          const playerResultCopy = { ...playerResult };
          calculatePlayerPoints(playerResultCopy, scoringSettings);
          
          return {
              playerId: playerId,
              tournamentId: tournament.id,
              tournamentName: tournament.name,
              tournamentDate: tournament.date,
              playerRank: playerResultCopy.rank,
              playerPoints: playerResultCopy.points,
              leagueName: leagueSettings[tournament.league]?.name || tournament.league,
          };
      });

    tournamentsForHistory = (await Promise.all(historyPromises))
      .sort((a, b) => {
        const dateA = a.tournamentDate instanceof Timestamp ? a.tournamentDate.toMillis() : new Date(a.tournamentDate as string).getTime();
        const dateB = b.tournamentDate instanceof Timestamp ? b.tournamentDate.toMillis() : new Date(b.tournamentDate as string).getTime();
        return dateB - dateA;
      });

    pageSubtitle = 'Общая карьерная статистика';
  }

  return (
    <PlayerPageClient
      player={playerForCard}
      tournaments={tournamentsForHistory}
      viewMode={viewMode}
      pageSubtitle={pageSubtitle}
      contextId={tournamentId}
      scoringSettings={scoringSettingsForHelp}
      leagueName={leagueNameForHelp}
    />
  );
}
