import { initFirebaseSDK, isFirebaseConfigured, dynamicImport } from './firebase';

export interface UserProfileFirestore {
  uid: string;
  email: string;
  displayName: string;
  role: 'ADMIN' | 'SAFETY_OFFICER' | 'CONTROL_OPERATOR' | 'RESCUE_TEAM' | 'VIEWER';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getUserProfileFromFirestore(uid: string): Promise<UserProfileFirestore | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    const { db } = await initFirebaseSDK();
    if (!db) return null;

    const { doc, getDoc } = await dynamicImport('firebase/firestore');
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfileFirestore;
    }
    return null;
  } catch (err) {
    console.error('[FIRESTORE] Failed to fetch user profile:', err);
    return null;
  }
}

export async function saveUserProfileToFirestore(profile: UserProfileFirestore): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;
  try {
    const { db } = await initFirebaseSDK();
    if (!db) return false;

    const { doc, setDoc } = await dynamicImport('firebase/firestore');
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(userRef, {
      ...profile,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('[FIRESTORE] Failed to save user profile:', err);
    return false;
  }
}

export function subscribeToFirestoreCollection<T = any>(
  collectionName: string,
  onData: (data: T[]) => void,
  onError?: (err: Error) => void
): () => void {
  let unsubscribeFn: (() => void) | null = null;

  if (!isFirebaseConfigured()) {
    onData([]);
    return () => {};
  }

  initFirebaseSDK().then(async ({ db }) => {
    if (!db) {
      onData([]);
      return;
    }
    try {
      const { collection, onSnapshot } = await dynamicImport('firebase/firestore');
      const colRef = collection(db, collectionName);
      unsubscribeFn = onSnapshot(
        colRef,
        (snapshot: any) => {
          const items = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }) as unknown as T);
          onData(items);
        },
        (error: any) => {
          console.warn(`[FIRESTORE] Snapshot error on collection ${collectionName}:`, error);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      if (onError) onError(err as Error);
    }
  });

  return () => {
    if (unsubscribeFn) unsubscribeFn();
  };
}
