import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let initError: string | null = null;

try {
  if (typeof window !== 'undefined') {
    // Ensure this only runs client-side
    if (getApps().length === 0) {
      if (!firebaseConfig.apiKey || !firebaseConfig.authDomain) {
        throw new Error('Missing critical Firebase client config');
      }
      app = initializeApp(firebaseConfig);
      console.log('[Firebase Client] Initialized new app.');
    } else {
      app = getApp();
      console.log('[Firebase Client] Using existing app.');
    }

    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  }
} catch (error) {
  console.error('[Firebase Client] Initialization failed:', error);
  initError = error instanceof Error ? error.message : String(error);
  app = null;
  auth = null;
  db = null;
  storage = null;
}

export { app, auth, db, storage, initError };
