import { collection, doc, getDocs } from 'firebase/firestore';
import { getDb } from '@/firebase/server';
import type { Partner } from './types';
import { unstable_noStore as noStore } from 'next/cache';

export async function getPartners(): Promise<Partner[]> {
  noStore();
  const db = getDb();
  const partnersCol = collection(db, 'partners');
  const snapshot = await getDocs(partnersCol);
  const partnerList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Partner));
  return partnerList;
}
