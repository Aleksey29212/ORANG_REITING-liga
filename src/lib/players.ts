import { collection, doc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { getDb } from '@/firebase/server';
import type { PlayerProfile } from './types';
import { unstable_noStore as noStore } from 'next/cache';

export async function getPlayerProfiles(): Promise<PlayerProfile[]> {
  noStore();
  const db = getDb();
  const playersCol = collection(db, 'players');
  const playerSnapshot = await getDocs(playersCol);
  const playerList = playerSnapshot.docs.map(doc => doc.data() as PlayerProfile);
  return playerList;
}

export async function getPlayerProfileById(id: string): Promise<PlayerProfile | undefined> {
  noStore();
  const db = getDb();
  const playerDocRef = doc(db, 'players', id);
  const playerSnap = await getDoc(playerDocRef);
  if (playerSnap.exists()) {
    return playerSnap.data() as PlayerProfile;
  }
  return undefined;
}

export async function updatePlayerProfiles(players: PlayerProfile[]): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  players.forEach(player => {
    const playerDocRef = doc(db, 'players', player.id);
    batch.set(playerDocRef, player, { merge: true });
  });
  await batch.commit();
}


export async function clearAllPlayerProfiles(): Promise<void> {
  const db = getDb();
  const playersCol = collection(db, 'players');
  const snapshot = await getDocs(playersCol);
  if (snapshot.empty) return;
  
  const batch = writeBatch(db);
  snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
  });
  await batch.commit();
}
