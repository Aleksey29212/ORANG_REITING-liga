'use server';

import { getPlayerProfiles, updatePlayerProfiles, clearAllPlayerProfiles, getPlayerProfileById } from '@/lib/players';
import { addTournaments, clearAllTournamentData, deleteTournamentById, getTournaments } from '@/lib/tournaments';
import { revalidatePath, revalidateTag } from 'next/cache';
import type { PlayerProfile, Tournament, ScoringSettings, LeagueId, AllLeagueSettings, Partner, TournamentPlayerResult, SponsorshipSettings } from '@/lib/types';
import * as cheerio from 'cheerio';
import { getAllScoringSettings, updateScoringSettings, updateLeagueSettings, getScoringSettings, updateBackgroundUrl, getLeagueSettings, updateSponsorshipSettings } from '@/lib/settings';
import { updateThemeAction as themeAction } from './themeActions';
import { calculatePlayerPoints } from '@/lib/scoring';
import { getDb } from '@/firebase/server';
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { headers } from 'next/headers';
import { getRankings } from '@/lib/leagues';

export async function importTournament(prevState: unknown, formData: FormData) {
  const tournamentIdsRaw = formData.get('tournamentId');
  const league = formData.get('league') as LeagueId;

  if (!tournamentIdsRaw || typeof tournamentIdsRaw !== 'string') {
    return { success: false, message: 'Неверный ID турнира.' };
  }
  if (!league) {
    return { success: false, message: 'Лига не выбрана.' };
  }

  const tournamentIds = tournamentIdsRaw.match(/\d+/g) || [];

  if (tournamentIds.length === 0) {
    return { success: false, message: 'Не найдены корректные ID турниров.' };
  }
  
  const scoringSettings = await getScoringSettings(league);

  const tournamentsToCreate: Omit<Tournament, 'id'>[] = [];
  let playerProfiles = await getPlayerProfiles();
  const newPlayerProfiles: PlayerProfile[] = [];
  const errors: string[] = [];

  for (const tournamentId of tournamentIds) {
    try {
      let html = '';
      let response;
      const urlsToTry = [
        `https://dartsbase.ru/tournaments/${tournamentId}/stats`,
        `https://dartsbase.ru/tournaments/${tournamentId}`
      ];
      
      for (const url of urlsToTry) {
          response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36' },
            cache: 'no-store'
          });
          
          if (response.ok) {
              const tempHtml = await response.text();
              const $temp = cheerio.load(tempHtml);
              const ths = $temp('th').filter((i, el) => {
                  const text = $temp(el).text().trim().toLowerCase();
                  return text === 'avg' || text === 'ср';
              });
              if (ths.length > 0) {
                  html = tempHtml;
                  break;
              }
          }
      }

      if (!html) {
        throw new Error(`На странице для турнира #${tournamentId} не найдена таблица статистики.`);
      }
      
      const $ = cheerio.load(html);
      
      const h1 = $('h1').first();
      const h1Clone = h1.clone();
      h1Clone.find('span').remove();
      let tournamentName = h1Clone.text().trim();
      if (!tournamentName) {
        tournamentName = `Турнир #${tournamentId}`;
      }

      const dateString = h1.find('span.text-gray-500').first().text().trim();
      let tournamentDate = new Date();
      if (dateString) {
          const dateParts = dateString.split('.');
          if (dateParts.length === 3) {
              tournamentDate = new Date(Date.UTC(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0])));
          }
      }
      
      const table = $('table').first();
      const headerCells = table.find('thead tr th');
      
      const headerMap: { [key: string]: number } = {};
      headerCells.each((i, el) => {
        const headerText = $(el).text().trim().toLowerCase();
        if (headerText.includes('hi-out')) {
            headerMap['hiout'] = i;
        } else if (headerText.includes('best leg')) {
            headerMap['bestleg'] = i;
        } else if (headerText.startsWith('#')) {
            headerMap['rank'] = i;
        } else {
            headerMap[headerText] = i;
        }
      });
      
      const rankIndex = headerMap['rank'] ?? 0;
      const nameIndex = headerMap['player'] ?? headerMap['игрок'] ?? 1;
      const avgIndex = headerMap['avg'] ?? headerMap['ср'];
      const n180Index = headerMap['180'];
      const hiOutIndex = headerMap['hiout'];
      const bestLegIndex = headerMap['bestleg'];

      if (avgIndex === undefined) {
        throw new Error(`На странице для турнира #${tournamentId} не найдена колонка 'AVG' в таблице статистики.`);
      }

      const tournamentResults: TournamentPlayerResult[] = [];
      
      table.find('tbody tr').each((i, row) => {
        const columns = $(row).find('td');
        
        const getColumnText = (index: number | undefined): string => {
            if (index === undefined || index < 0 || index >= columns.length) return '';
            return $(columns[index]).text().trim();
        };

        const rank = parseInt(getColumnText(rankIndex), 10) || 999;
        
        const nameCell = columns.eq(nameIndex);
        const playerLink = nameCell.find('a');
        let name = playerLink.text().trim() || nameCell.text().trim();
        if (!name) return;

        let playerId;
        const playerHref = playerLink.attr('href');
        if (playerHref) {
            playerId = playerHref.split('/').pop() || name.replace(/\s+/g, '-').toLowerCase();
        } else {
            playerId = name.replace(/\s+/g, '-').toLowerCase();
        }
        
        if (!playerProfiles.some(p => p.id === playerId) && !newPlayerProfiles.some(p => p.id === playerId)) {
            newPlayerProfiles.push({
                id: playerId,
                name: name,
                nickname: 'Новичок',
                avatarUrl: `https://picsum.photos/seed/${encodeURIComponent(name)}/400/400`,
                bio: `Профиль игрока, автоматически созданный при импорте турнира.`,
                imageHint: 'person portrait',
                backgroundUrl: 'https://images.unsplash.com/photo-1544098485-2a216e2133c1',
                backgroundImageHint: 'abstract background',
            });
        }

        const avg = parseFloat(getColumnText(avgIndex).replace(',', '.')) || 0;
        const n180s = n180Index !== undefined ? parseInt(getColumnText(n180Index), 10) || 0 : 0;
        const hiOut = hiOutIndex !== undefined ? parseInt(getColumnText(hiOutIndex), 10) || 0 : 0;
        const bestLeg = bestLegIndex !== undefined ? parseInt(getColumnText(bestLegIndex), 10) || 0 : 0;
        
        const playerResult: TournamentPlayerResult = {
          id: playerId,
          name: name,
          nickname: 'Новичок',
          rank: rank,
          points: 0,
          basePoints: 0,
          bonusPoints: 0,
          is180BonusApplied: false,
          pointsFor180s: 0,
          isHiOutBonusApplied: false,
          pointsForHiOut: 0,
          isAvgBonusApplied: false,
          pointsForAvg: 0,
          isBestLegBonusApplied: false,
          pointsForBestLeg: 0,
          is9DarterBonusApplied: false,
          pointsFor9Darter: 0,
          avatarUrl: `https://picsum.photos/seed/${encodeURIComponent(name)}/400/400`,
          imageHint: 'person portrait',
          avg: avg,
          n180s: n180s,
          hiOut: hiOut,
          bestLeg: bestLeg,
        };

        calculatePlayerPoints(playerResult, scoringSettings);
        tournamentResults.push(playerResult);
      });

      if (tournamentResults.length === 0) throw new Error('Не найдено данных игроков.');
      
      tournamentsToCreate.push({
        id: tournamentId,
        name: tournamentName,
        date: tournamentDate.toISOString(),
        league: league,
        players: tournamentResults,
      } as Omit<Tournament, 'id'>);

    } catch (e: any) {
      errors.push(`ID ${tournamentId}: ${e.message}`);
    }
  }

  if (newPlayerProfiles.length > 0) {
      await updatePlayerProfiles([...playerProfiles, ...newPlayerProfiles]);
  }
  
  const addedTournamentIds = await addTournaments(tournamentsToCreate);

  revalidateTag('rankings');
  revalidatePath('/', 'layout');
  
  const successMessage = addedTournamentIds.length > 0 
    ? `Турниры ${addedTournamentIds.join(', ')} импортированы!` 
    : 'Новых турниров не добавлено.';
  const errorMessage = errors.length > 0 ? ` Ошибки: ${errors.join('; ')}` : '';
  
  return { success: true, message: `${successMessage}${errorMessage}` };
}

export async function updatePlayer(player: PlayerProfile) {
  try {
    await updatePlayerProfiles([player]);
    revalidateTag('rankings');
    revalidatePath('/', 'layout');
    return { success: true, message: `Профиль игрока ${player.name} успешно обновлен.` };
  } catch (error) {
    return { success: false, message: 'Не удалось обновить профиль.' };
  }
}

export async function updatePlayerAvatar(playerId: string, avatarUrl: string | null) {
  try {
    const player = await getPlayerProfileById(playerId);
    if (!player) return { success: false, message: 'Игрок не найден.' };

    const updatedPlayer = {
      ...player,
      avatarUrl: avatarUrl || `https://picsum.photos/seed/${encodeURIComponent(player.name)}/400/400`,
    };

    await updatePlayerProfiles([updatedPlayer]);
    revalidateTag('rankings');
    revalidatePath('/', 'layout');
    return { success: true, message: 'Аватар обновлен.' };
  } catch (error) {
    return { success: false, message: 'Ошибка при обновлении аватара.' };
  }
}

export async function deletePlayerAction(playerId: string) {
    try {
        const db = getDb();
        await deleteDoc(doc(db, 'players', playerId));
        revalidateTag('rankings');
        revalidatePath('/', 'layout');
        return { success: true, message: 'Игрок удален.' };
    } catch (e) {
        return { success: false, message: 'Ошибка удаления.' };
    }
}

export async function clearAllPlayerData() {
  await clearAllPlayerProfiles();
  await clearAllTournamentData();
  revalidateTag('rankings');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Все данные удалены.' };
}

export async function clearTournamentsAction() {
  await clearAllTournamentData();
  revalidateTag('rankings');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Все данные о турнирах удалены, статистика игроков сброшена.' };
}

export async function saveScoringSettings(leagueId: LeagueId, data: ScoringSettings) {
  try {
    await updateScoringSettings(leagueId, data);
    revalidateTag('rankings');
    revalidatePath('/', 'layout');
    return { success: true, message: `Настройки сохранены!` };
  } catch (error) {
    return { success: false, message: 'Ошибка сохранения.' };
  }
}

export async function saveLeagueSettings(data: AllLeagueSettings) {
  try {
    await updateLeagueSettings(data);
    revalidateTag('rankings');
    revalidatePath('/', 'layout');
    return { success: true, message: 'Лиги обновлены!' };
  } catch (error) {
    return { success: false, message: 'Ошибка.' };
  }
}

export async function deleteTournamentAction(tournamentId: string) {
    await deleteTournamentById(tournamentId);
    revalidateTag('rankings');
    revalidatePath('/', 'layout');
    return { success: true, message: `Турнир удален.` };
}

export async function updateThemeAction(theme: any) {
  return themeAction(theme);
}

export async function saveBackgroundAction(prevState: unknown, formData: FormData) {
  const intent = formData.get('intent');
  try {
    if (intent === 'reset') {
      await updateBackgroundUrl('');
    } else {
      const url = formData.get('url') as string;
      await updateBackgroundUrl(url);
    }
    revalidatePath('/', 'layout');
    return { success: true, message: 'Фон обновлен.' };
  } catch (error) {
    return { success: false, message: 'Ошибка.' };
  }
}

export async function saveSponsorshipAction(data: SponsorshipSettings) {
    try {
        await updateSponsorshipSettings(data);
        revalidatePath('/', 'layout');
        return { success: true, message: 'Настройки обновлены.' };
    } catch (e) {
        return { success: false, message: 'Ошибка.' };
    }
}

export async function logVisitAction() {
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'unknown';
    if (/bot|crawl|spider|slurp|google|bing|yandex/i.test(userAgent)) return;
    const db = getDb();
    await addDoc(collection(db, 'visits'), { timestamp: serverTimestamp() });
  } catch (e) {}
}

export async function logSponsorClickAction(playerId: string, playerName: string, sponsorName: string) {
    try {
        const db = getDb();
        await addDoc(collection(db, 'sponsor_clicks'), {
            playerId, playerName, sponsorName, timestamp: serverTimestamp(),
        });
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}

export async function exportAllRankingsAction() {
    try {
        const leagueSettings = await getLeagueSettings();
        const leaguesToProcess: LeagueId[] = Array.from(new Set(['general', ...(Object.keys(leagueSettings) as LeagueId[]).filter(key => (leagueSettings as any)[key].enabled)])) as LeagueId[];
        const headers = ['League', 'Rank', 'Name', 'Nickname', 'Points', 'Matches', 'AVG', '180s', 'Hi-Out'];
        let csvRows = [headers.join(',')];
        for (const leagueId of leaguesToProcess) {
            const players = await getRankings(leagueId);
            players.filter(p => p.matchesPlayed > 0).forEach(p => {
                csvRows.push([leagueId, p.rank, p.name, p.nickname, p.points, p.matchesPlayed, p.avg.toFixed(2), p.n180s, p.hiOut].join(','));
            });
        }
        return { success: true, csv: csvRows.join('\n') };
    } catch(e) {
        return { success: false, message: 'Ошибка экспорта.' };
    }
}
