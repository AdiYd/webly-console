import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';
import { getAuth, Auth } from 'firebase-admin/auth';
import { serverLogger } from '@/utils/logger';

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

  serverLogger.info('Firebase Admin', 'Initializing...');
  const apps = getApps();
  if (apps.length > 0) {
    serverLogger.info('Firebase Admin', 'Using existing app.');
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
    // Check for the Base64 encoded credentials
    if (!process.env.FIREBASE_ADMIN_SDK_BASE64) {
      throw new Error('Missing Firebase Admin credentials in environment variables');
    }

    // Decode and parse the Base64 credentials
    const decodedCredentials = Buffer.from(
      process.env.FIREBASE_ADMIN_SDK_BASE64,
      'base64'
    ).toString('utf-8');

    const serviceAccount = JSON.parse(decodedCredentials);

    // Initialize the app with the credentials
    const newApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

    serverLogger.info('Firebase Admin', 'Initialized successfully.');
    adminInstance = {
      app: newApp,
      db: getFirestore(newApp),
      auth: getAuth(newApp),
      storage: getStorage(newApp),
    };
    return adminInstance;
  } catch (error) {
    serverLogger.error('Firebase Admin', 'Initialization failed:', error);
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
    serverLogger.error('Firebase Admin', 'Could not initialize:', error);
    // Return a mock object that logs errors when methods are called
    // This allows the application to continue running even if Firebase Admin isn't properly initialized
    const errorHandler =
      (method: string) =>
      (...args: any[]) => {
        serverLogger.error(
          'Firebase Admin',
          `Method '${method}' called but Firebase Admin is not initialized`
        );
        throw new Error(`Firebase Admin is not initialized. Cannot call '${method}'`);
      };

    const mockFirestore = {
      collection: errorHandler('collection'),
      doc: errorHandler('doc'),
      getDoc: errorHandler('getDoc'),
      setDoc: errorHandler('setDoc'),
      listCollections: errorHandler('listCollections'),
    } as unknown as Firestore;

    return {
      app: {} as App,
      db: mockFirestore,
      auth: {} as Auth,
      storage: {} as Storage,
    };
  }
}
