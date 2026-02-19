import { collection, doc, getDocs, deleteDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { getDb } from '@/firebase/server';
import type { Tournament } from './types';
import { unstable_noStore as noStore } from 'next/cache';
import { getDoc } from 'firebase/firestore';

export async function getTournaments(): Promise<Tournament[]> {
  noStore();
  const db = getDb();
  const tournamentsCol = collection(db, 'tournaments');
  const tournamentSnapshot = await getDocs(tournamentsCol);
  const tournamentList = tournamentSnapshot.docs.map(doc => {
    const data = doc.data();
    // Convert Firestore Timestamp to JS Date string
    if (data.date instanceof Timestamp) {
      data.date = data.date.toDate().toISOString();
    }
    return { id: doc.id, ...data } as Tournament;
  });
  return tournamentList;
}

export async function addTournaments(newTournaments: Omit<Tournament, 'id'>[]): Promise<string[]> {
    if (!newTournaments || newTournaments.length === 0) {
        return [];
    }
    const db = getDb();
    const batch = writeBatch(db);
    const actuallyAddedIds: string[] = [];

    for (const newT of newTournaments) {
        // Assume newT.id from import is the desired document ID
        const docId = (newT as Tournament).id;
        const docRef = doc(db, 'tournaments', docId);

        // Always set the document, overwriting if it exists to allow data correction.
        const dataToSet = { ...newT, date: Timestamp.fromDate(new Date(newT.date as string)) };
        delete (dataToSet as any).id; // Don't store id inside the document
        
        batch.set(docRef, dataToSet);
        actuallyAddedIds.push(docId);
    }
    
    if (actuallyAddedIds.length > 0) {
        await batch.commit();
    }
    return actuallyAddedIds;
}

export async function getTournamentById(id: string): Promise<Tournament | undefined> {
    noStore();
    const db = getDb();
    const tournamentDocRef = doc(db, 'tournaments', id);
    const docSnap = await getDoc(tournamentDocRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.date instanceof Timestamp) {
            data.date = data.date.toDate().toISOString();
        }
        return { id: docSnap.id, ...data } as Tournament;
    }
    return undefined;
}


export async function deleteTournamentById(id: string): Promise<void> {
    const db = getDb();
    const tournamentDocRef = doc(db, 'tournaments', id);
    await deleteDoc(tournamentDocRef);
}

export async function clearAllTournamentData(): Promise<void> {
    const db = getDb();
    const tournamentsCol = collection(db, 'tournaments');
    const snapshot = await getDocs(tournamentsCol);
    if (snapshot.empty) return;
    
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}
