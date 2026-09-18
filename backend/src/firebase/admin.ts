import dotenv from 'dotenv';
import { createRequire } from 'node:module';
dotenv.config();

const require = createRequire(import.meta.url);

let firebaseAdminApp: any = null;
let adminAuth: any = null;
let firestoreAdmin: any = null;
let isAdminInitialized = false;

const projectId = process.env.FIREBASE_PROJECT_ID || 'mine-safety-rover';
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

try {
  const { initializeApp, getApps, getApp, cert } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');
  const { getAuth } = require('firebase-admin/auth');

  const existingApps = getApps();
  if (!existingApps.length) {
    if (clientEmail && privateKey) {
      firebaseAdminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
      console.log('[FIREBASE ADMIN] Initialized with Service Account cert for project:', projectId);
    } else {
      firebaseAdminApp = initializeApp({
        projectId,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
      console.log('[FIREBASE ADMIN] Initialized with project ID:', projectId);
    }
  } else {
    firebaseAdminApp = getApp();
  }

  if (firebaseAdminApp && clientEmail && privateKey) {
    adminAuth = getAuth(firebaseAdminApp);
    firestoreAdmin = getFirestore(firebaseAdminApp);
    isAdminInitialized = true;
  } else {
    console.log('[FIREBASE ADMIN] Service Account credentials not provided; Firestore Admin routing to local store.');
  }
} catch (error: any) {
  console.info('[FIREBASE ADMIN] Initialization note:', error.message);
}

export { firebaseAdminApp, adminAuth, firestoreAdmin, isAdminInitialized };
