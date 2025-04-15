import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';
import { getAuth, Auth } from 'firebase-admin/auth';

// Ensure this file is never imported client-side (though bundler should handle it)
if (typeof window !== 'undefined') {
  throw new Error('Firebase Admin SDK cannot be imported on the client.');
}

interface AdminFirebase {
  db: Firestore;
  auth: Auth;
  storage: Storage;
  app: App;
}

let adminInstance: AdminFirebase | null = null;

function initializeAdmin(): AdminFirebase {
  if (adminInstance) {
    return adminInstance;
  }

  console.log('[Firebase Admin] Initializing...');
  const apps = getApps();
  if (apps.length > 0) {
    console.log('[Firebase Admin] Using existing app.');
    const existingApp = apps[0]; // Assuming the first app is the admin app if already initialized
    adminInstance = {
      app: existingApp,
      db: getFirestore(existingApp),
      auth: getAuth(existingApp),
      storage: getStorage(existingApp),
    };
    return adminInstance;
  }

  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
      throw new Error('Missing Firebase Admin credentials in environment variables');
    }

    const newApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

    console.log('[Firebase Admin] Initialized successfully.');
    adminInstance = {
      app: newApp,
      db: getFirestore(newApp),
      auth: getAuth(newApp),
      storage: getStorage(newApp),
    };
    return adminInstance;
  } catch (error) {
    console.error('[Firebase Admin] Initialization failed:', error);
    // Depending on your error handling, you might want to re-throw or handle differently
    throw new Error(
      `Firebase Admin initialization failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Export a getter function to ensure initialization happens lazily on first use server-side
export function getAdminFirebase(): AdminFirebase {
  return initializeAdmin();
}
