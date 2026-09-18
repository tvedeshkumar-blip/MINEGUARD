import { initFirebaseSDK, isFirebaseConfigured, dynamicImport } from './firebase';

export interface AuthStateChangeCallback {
  (user: any | null): void;
}

export async function loginWithFirebase(email: string, password: string): Promise<any> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase Auth is not configured.');
  }

  const { auth } = await initFirebaseSDK();
  if (!auth) {
    throw new Error('Firebase Auth SDK is not available.');
  }

  try {
    const { signInWithEmailAndPassword } = await dynamicImport('firebase/auth');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('[FIREBASE AUTH ERROR]', error.code, error.message);
    throw error;
  }
}

export async function logoutFirebase(): Promise<void> {
  try {
    const { auth } = await initFirebaseSDK();
    if (auth) {
      const { signOut } = await dynamicImport('firebase/auth');
      await signOut(auth);
    }
  } catch (err) {
    // Ignore signout error on fallback
  }
}

export function subscribeToAuthState(callback: AuthStateChangeCallback): () => void {
  let unsub: (() => void) | null = null;

  if (!isFirebaseConfigured()) {
    callback(null);
    return () => {};
  }

  initFirebaseSDK().then(async ({ auth }) => {
    if (auth) {
      try {
        const { onAuthStateChanged } = await dynamicImport('firebase/auth');
        unsub = onAuthStateChanged(auth, callback);
      } catch {
        callback(null);
      }
    } else {
      callback(null);
    }
  });

  return () => {
    if (unsub) unsub();
  };
}

export async function getCurrentUserToken(forceRefresh: boolean = false): Promise<string | null> {
  try {
    const { auth } = await initFirebaseSDK();
    if (!auth || !auth.currentUser) return null;
    return await auth.currentUser.getIdToken(forceRefresh);
  } catch (error) {
    console.error('[FIREBASE] Failed to retrieve ID token:', error);
    return null;
  }
}
