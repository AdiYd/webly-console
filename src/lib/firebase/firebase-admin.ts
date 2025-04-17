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
    // Validate private key format
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('FIREBASE_PRIVATE_KEY environment variable is not set');
    }

    // Handle various PEM formatting issues
    privateKey = privateKey.replace(/\\n/g, '\n');

    // Remove any surrounding quotes that might have been added in the .env file
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }

    // Validate basic PEM format structure
    if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
      throw new Error('Invalid private key format. Must be a valid PEM-formatted private key');
    }

    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
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
    // Provide a detailed error message but don't crash the application
    throw new Error(
      `Firebase Admin initialization failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Wrapped in a try-catch to prevent application crashes
export function getAdminFirebase(): AdminFirebase {
  try {
    return initializeAdmin();
  } catch (error) {
    console.error('[Firebase Admin] Could not initialize:', error);
    // Return a mock object that logs errors when methods are called
    // This allows the application to continue running even if Firebase Admin isn't properly initialized
    const errorHandler =
      (method: string) =>
      (...args: any[]) => {
        console.error(
          `[Firebase Admin] Method '${method}' called but Firebase Admin is not initialized`
        );
        throw new Error(`Firebase Admin is not initialized. Cannot call '${method}'`);
      };

    const mockFirestore = {
      collection: errorHandler('collection'),
      doc: errorHandler('doc'),
      getDoc: errorHandler('getDoc'),
      setDoc: errorHandler('setDoc'),
    } as unknown as Firestore;

    return {
      app: {} as App,
      db: mockFirestore,
      auth: {} as Auth,
      storage: {} as Storage,
    };
  }
}
