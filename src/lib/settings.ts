import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { getDb } from '@/firebase/server';
import type { ScoringSettings, AllLeagueSettings, LeagueId, SponsorshipSettings } from './types';
import { unstable_noStore as noStore } from 'next/cache';
import defaultScoringSettingsData from './scoring-settings.json';

const defaultAllLeagueSettings: AllLeagueSettings = {
    general: { enabled: true, name: 'Общий рейтинг' },
    premier: { enabled: false, name: 'Премьер-лига' },
    first: { enabled: false, name: 'Первая лига' },
    cricket: { enabled: false, name: 'Крикет' },
    senior: { enabled: false, name: 'Сеньоры' },
    youth: { enabled: false, name: 'Юниоры' },
    women: { enabled: false, name: 'Женская лига' },
};


export async function getAllScoringSettings(): Promise<Record<LeagueId, ScoringSettings>> {
  noStore();
  const db = getDb();
  const settingsCol = collection(db, 'scoring_configurations');
  const snapshot = await getDocs(settingsCol);
  
  const allDefaults: Record<LeagueId, ScoringSettings> = defaultScoringSettingsData as any;

  if (snapshot.empty) {
    // If no settings in DB, return defaults from JSON
    return allDefaults;
  }
  
  const fromDb: Partial<Record<LeagueId, ScoringSettings>> = {};
  snapshot.docs.forEach(doc => {
      fromDb[doc.id as LeagueId] = { id: doc.id, ...doc.data() } as ScoringSettings;
  });

  // Merge DB settings over the defaults from JSON
  const finalSettings: Record<LeagueId, ScoringSettings> = {
    general: { ...allDefaults.general, ...fromDb.general },
    premier: { ...allDefaults.premier, ...fromDb.premier },
    first: { ...allDefaults.first, ...fromDb.first },
    cricket: { ...allDefaults.cricket, ...fromDb.cricket },
    senior: { ...allDefaults.senior, ...fromDb.senior },
    youth: { ...allDefaults.youth, ...fromDb.youth },
    women: { ...allDefaults.women, ...fromDb.women },
  };

  return finalSettings;
}

export async function getScoringSettings(leagueId: LeagueId): Promise<ScoringSettings> {
  noStore();
  const db = getDb();
  const docRef = doc(db, 'scoring_configurations', leagueId);
  const docSnap = await getDoc(docRef);

  const defaults = (defaultScoringSettingsData as any)[leagueId];

  if (docSnap.exists()) {
    // Merge with defaults to ensure all properties are present
    return { ...defaults, ...docSnap.data(), id: docSnap.id } as ScoringSettings;
  }
  // If specific league settings don't exist, return default from JSON
  return { ...defaults, id: leagueId } as ScoringSettings;
}

export async function updateScoringSettings(leagueId: LeagueId, settings: ScoringSettings): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'scoring_configurations', leagueId);
  const dataToSet = { ...settings };
  delete dataToSet.id; // Don't store the ID inside the document
  await setDoc(docRef, dataToSet);
}


export async function getLeagueSettings(): Promise<AllLeagueSettings> {
    noStore();
    const db = getDb();
    const docRef = doc(db, 'app_settings', 'leagues');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data() as AllLeagueSettings;
        // Ensure new leagues exist in the returned data if they were recently added to code
        return { ...defaultAllLeagueSettings, ...data };
    }
    // If no settings, return defaults
    return defaultAllLeagueSettings;
}

export async function updateLeagueSettings(settings: AllLeagueSettings): Promise<void> {
    const db = getDb();
    const docRef = doc(db, 'app_settings', 'leagues');
    await setDoc(docRef, settings);
}

export async function getBackgroundUrl(): Promise<string> {
    noStore();
    const db = getDb();
    const docRef = doc(db, 'app_settings', 'background');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data().url || '';
    }
    return '';
}

export async function updateBackgroundUrl(url: string): Promise<void> {
    const db = getDb();
    const docRef = doc(db, 'app_settings', 'background');
    await setDoc(docRef, { url });
}

export async function getSponsorshipSettings(): Promise<SponsorshipSettings> {
    noStore();
    const db = getDb();
    const docRef = doc(db, 'app_settings', 'sponsorship');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            adminTelegramLink: data.adminTelegramLink || 'https://t.me/dartbrig_admin',
            groupTelegramLink: data.groupTelegramLink || 'https://t.me/dartbrig_admin',
            adminVkLink: data.adminVkLink || 'https://vk.com/dartbrig',
            groupVkLink: data.groupVkLink || 'https://vk.com/dartbrig',
            showGlobalSponsorCta: data.showGlobalSponsorCta ?? true
        };
    }
    return {
        adminTelegramLink: 'https://t.me/dartbrig_admin',
        groupTelegramLink: 'https://t.me/dartbrig_admin',
        adminVkLink: 'https://vk.com/dartbrig',
        groupVkLink: 'https://vk.com/dartbrig',
        showGlobalSponsorCta: true
    };
}

export async function updateSponsorshipSettings(settings: SponsorshipSettings): Promise<void> {
    const db = getDb();
    const docRef = doc(db, 'app_settings', 'sponsorship');
    await setDoc(docRef, settings);
}
