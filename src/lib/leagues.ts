import { getPlayerProfiles } from '@/lib/players';
import { getTournaments } from '@/lib/tournaments';
import { getAllScoringSettings } from '@/lib/settings';
import type { Player, Tournament, LeagueId, PlayerProfile, TournamentPlayerResult } from '@/lib/types';
import { unstable_cache } from 'next/cache';
import { calculatePlayerPoints } from './scoring';
import { safeNumber } from './utils';

async function calculateRankingsForLeague(leagueId: LeagueId): Promise<Player[]> {
    const [playerProfiles, allTournaments, allScoringSettings] = await Promise.all([
        getPlayerProfiles(),
        getTournaments(),
        getAllScoringSettings(),
    ]);

    const tournamentsToProcess = leagueId === 'general'
        ? allTournaments
        : allTournaments.filter(t => t.league === leagueId);
    
    // Recalculate points for each player in each tournament using the correct settings
    tournamentsToProcess.forEach(tournament => {
        const settingsForThisTournament = allScoringSettings[tournament.league];
        if (settingsForThisTournament) {
            tournament.players.forEach(playerResult => {
                calculatePlayerPoints(playerResult, settingsForThisTournament);
            });
        }
    });

    const allPlayerResults = tournamentsToProcess.flatMap(t => 
        t.players.map(p => ({ ...p, tournamentDate: t.date }))
    );

    const resultsByPlayer = new Map<string, (TournamentPlayerResult & { tournamentDate: Tournament['date'] })[]>();
    allPlayerResults.forEach(result => {
        if (!resultsByPlayer.has(result.id)) {
            resultsByPlayer.set(result.id, []);
        }
        resultsByPlayer.get(result.id)!.push(result);
    });

    const allPlayers: Omit<Player, 'rank'>[] = playerProfiles.map(profile => {
        const results = resultsByPlayer.get(profile.id) || [];
        
        const initialStats = {
            points: 0,
            basePoints: 0,
            bonusPoints: 0,
            matchesPlayed: 0,
            wins: 0,
            n180s: 0,
            hiOut: 0,
            bestLeg: 999,
            avgSum: 0,
            totalPointsFor180s: 0,
            totalPointsForHiOut: 0,
            totalPointsForAvg: 0,
            totalPointsForBestLeg: 0,
            totalPointsFor9Darter: 0,
        };
        
        const stats = results.reduce((acc, r) => {
            acc.points += safeNumber(r.points);
            acc.basePoints += safeNumber(r.basePoints);
            acc.bonusPoints += safeNumber(r.bonusPoints);
            acc.matchesPlayed += 1;
            acc.wins += (safeNumber(r.rank) <= 8 ? 1 : 0);
            acc.n180s += safeNumber(r.n180s);
            acc.hiOut = Math.max(acc.hiOut, safeNumber(r.hiOut));
            
            const bestLeg = safeNumber(r.bestLeg);
            if (bestLeg > 0 && bestLeg < acc.bestLeg) {
                acc.bestLeg = bestLeg;
            }
            
            acc.avgSum += safeNumber(r.avg);

            acc.totalPointsFor180s += safeNumber(r.pointsFor180s);
            acc.totalPointsForHiOut += safeNumber(r.pointsForHiOut);
            acc.totalPointsForAvg += safeNumber(r.pointsForAvg);
            acc.totalPointsForBestLeg += safeNumber(r.pointsForBestLeg);
            acc.totalPointsFor9Darter += safeNumber(r.pointsFor9Darter);

            return acc;
        }, initialStats);

        if (stats.bestLeg === 999) {
            stats.bestLeg = 0;
        }
        
        const losses = stats.matchesPlayed - stats.wins;
        const avg = results.length > 0 ? stats.avgSum / results.length : 0;

        return {
            ...profile,
            points: stats.points,
            basePoints: stats.basePoints,
            bonusPoints: stats.bonusPoints,
            matchesPlayed: stats.matchesPlayed,
            wins: stats.wins,
            losses,
            avg,
            n180s: stats.n180s,
            hiOut: stats.hiOut,
            bestLeg: stats.bestLeg,
            totalPointsFor180s: stats.totalPointsFor180s,
            totalPointsForHiOut: stats.totalPointsForHiOut,
            totalPointsForAvg: stats.totalPointsForAvg,
            totalPointsForBestLeg: stats.totalPointsForBestLeg,
            totalPointsFor9Darter: stats.totalPointsFor9Darter,
        };
    });

    const playersWithMatches = allPlayers.filter(p => p.matchesPlayed > 0);
    const playersWithoutMatches = allPlayers.filter(p => p.matchesPlayed === 0);

    playersWithMatches.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.basePoints !== a.basePoints) return b.basePoints - a.basePoints;
        if (b.avg !== a.avg) return b.avg - a.avg;
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.matchesPlayed - a.matchesPlayed;
    });

    const rankedPlayers: Player[] = [];
    let currentRank = 0;
    for (let i = 0; i < playersWithMatches.length; i++) {
        if (i === 0 || 
            playersWithMatches[i].points !== playersWithMatches[i-1].points ||
            playersWithMatches[i].basePoints !== playersWithMatches[i-1].basePoints ||
            playersWithMatches[i].avg !== playersWithMatches[i-1].avg ||
            playersWithMatches[i].wins !== playersWithMatches[i-1].wins ||
            playersWithMatches[i].matchesPlayed !== playersWithMatches[i-1].matchesPlayed
        ) {
            currentRank = i + 1;
        }
        rankedPlayers.push({ ...playersWithMatches[i], rank: currentRank });
    }

    const unrankedPlayers = playersWithoutMatches.map(player => ({
        ...player,
        rank: 0,
    }));
    
    return [...rankedPlayers, ...unrankedPlayers];
}

export const getRankings = (leagueId: LeagueId) => unstable_cache(
    async () => calculateRankingsForLeague(leagueId),
    [`rankings-${leagueId}`],
    { tags: ['rankings', `rankings-${leagueId}`], revalidate: 3600 }
)();
