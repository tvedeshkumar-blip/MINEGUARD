/**
 * Firebase Client SDK Initialization Module for MINEGUARD Frontend.
 * Uses decoupled runtime imports so Vite compiles cleanly even before npm dependencies are installed.
 */

export const getFirebaseConfig = () => ({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
});

export const isFirebaseConfigured = (): boolean => {
  const cfg = getFirebaseConfig();
  return (
    Boolean(cfg.apiKey) &&
    cfg.apiKey !== 'YOUR_FIREBASE_WEB_API_KEY' &&
    Boolean(cfg.projectId) &&
    cfg.projectId !== 'YOUR_PROJECT_ID'
  );
};

export const dynamicImport = (moduleName: string): Promise<any> => {
  try {
    return new Function('m', 'return import(m)')(moduleName);
  } catch (err) {
    return Promise.reject(err);
  }
};

let appInstance: any = null;
let authInstance: any = null;
let firestoreInstance: any = null;

export async function initFirebaseSDK() {
  if (appInstance) {
    return { app: appInstance, auth: authInstance, db: firestoreInstance };
  }

  if (!isFirebaseConfigured()) {
    return { app: null, auth: null, db: null };
  }

  try {
    const { initializeApp, getApps, getApp } = await dynamicImport('firebase/app');
    const { getAuth } = await dynamicImport('firebase/auth');
    const { getFirestore } = await dynamicImport('firebase/firestore');

    const config = getFirebaseConfig();
    appInstance = !getApps().length ? initializeApp(config) : getApp();
    authInstance = getAuth(appInstance);
    firestoreInstance = getFirestore(appInstance);

    console.log('[FIREBASE] Client SDK initialization successful for project:', config.projectId);
    return { app: appInstance, auth: authInstance, db: firestoreInstance };
  } catch (err: any) {
    console.info('[FIREBASE] Operating in local demo fallback mode:', err.message);
    return { app: null, auth: null, db: null };
  }
}

export { appInstance as app, authInstance as auth, firestoreInstance as firestoreDb };
