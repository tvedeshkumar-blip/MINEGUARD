// frontend/src/services/firebase.ts
// Centralized Firebase RTDB Configuration Loader & Environment Validator

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

/**
 * Returns Firebase Client Configuration loaded from Vite Environment Variables.
 * Validates that essential URLs are defined.
 */
export function getFirebaseConfig(): FirebaseConfig {
  const databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://mine-safety-rover-default-rtdb.firebaseio.com';
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mine-safety-rover';
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_FIREBASE_API_KEY';

  if (!databaseURL) {
    console.error('[MINEGUARD Firebase Error] Missing required environment variable: VITE_FIREBASE_DATABASE_URL');
  }

  return {
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
    databaseURL,
    projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
  };
}

export const firebaseConfig = getFirebaseConfig();
