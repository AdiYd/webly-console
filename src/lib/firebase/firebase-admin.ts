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
  isInitialized: boolean;
}

let adminInstance: AdminFirebase | null = null;

// Error handler for when Firebase Admin is not initialized
const errorHandler = (method: string) => () => {
  serverLogger.error(
    'Firebase Admin',
    `Method '${method}' called but Firebase Admin is not initialized`
  );
  throw new Error(`Firebase Admin is not initialized. Cannot call '${method}'`);
};

export function getAdminFirebase(): AdminFirebase {
  if (adminInstance) {
    serverLogger.info('Firebase Admin', 'Returning existing initialized instance');
    return adminInstance;
  }

  serverLogger.info('Firebase Admin', 'Initializing...');

  try {
    // Check for existing apps first
    const apps = getApps();
    if (apps.length > 0) {
      serverLogger.info('Firebase Admin', 'Using existing app.');
      const existingApp = apps[0];

      // Simply get services from existing app without configuring settings again
      adminInstance = {
        app: existingApp,
        db: getFirestore(existingApp),
        auth: getAuth(existingApp),
        storage: getStorage(existingApp),
        isInitialized: true,
      };

      // Don't attempt to set settings again on an existing Firestore instance
      return adminInstance;
    }

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
      projectId: serviceAccount.project_id, // Ensure project ID is set
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

    // Get the database first so we can configure it
    const db = getFirestore(newApp);

    // Configure Firestore settings only on newly created instance
    // This must happen before any Firestore operations
    db.settings({
      ignoreUndefinedProperties: true,
    });

    // Then get other services
    const auth = getAuth(newApp);
    const storage = getStorage(newApp);

    serverLogger.info('Firebase Admin', 'Initialized successfully.');

    // Create and return the instance
    adminInstance = {
      app: newApp,
      db,
      auth,
      storage,
      isInitialized: true,
    };

    return adminInstance;
  } catch (error) {
    serverLogger.error('Firebase Admin', 'Failed to initialize:', error);

    const mockFirestore = {
      collection: errorHandler('collection'),
      doc: errorHandler('doc'),
      getDoc: errorHandler('getDoc'),
      setDoc: errorHandler('setDoc'),
      listCollections: errorHandler('listCollections'),
    } as unknown as Firestore;

    // Return a mock instance with error handlers that will throw when used
    return {
      app: {} as App,
      db: mockFirestore,
      auth: {} as Auth,
      storage: {} as Storage,
      isInitialized: false,
    };
  }
}
