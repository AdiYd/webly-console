// Client-side Firebase
import { initializeApp as initializeClientApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore as getClientFirestore } from 'firebase/firestore';
import { getStorage as getClientStorage } from 'firebase/storage';

// Debug utilities
const debugFirebase = (message: string, data?: any) => {
  console.log(`[Firebase Debug] ${message}`, data || '');
};

const logError = (context: string, error: unknown) => {
  const errorMsg = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.error(`[Firebase Error] ${context}: ${errorMsg}`);
  return errorMsg;
};

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

debugFirebase('Firebase configuration', {
  apiKeyExists: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomainExists: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectIdExists: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  configComplete: !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  ),
});

// Initialize Client Firebase
function initializeClientFirebase() {
  try {
    debugFirebase('Initializing Firebase client...');

    if (!firebaseConfig.apiKey || !firebaseConfig.authDomain) {
      throw new Error('Missing critical Firebase config: API key or auth domain');
    }

    const app = initializeClientApp(firebaseConfig);
    debugFirebase('Firebase app initialized', { appName: app.name });

    // Initialize services
    const auth = getAuth(app);
    debugFirebase('Firebase Auth initialized', {
      currentUser: auth.currentUser ? 'Exists' : 'None',
    });

    const db = getClientFirestore(app);
    debugFirebase('Firebase Firestore initialized');

    const storage = getClientStorage(app);
    debugFirebase('Firebase Storage initialized');

    return {
      app,
      db,
      auth,
      storage,
    };
  } catch (error) {
    const errorMsg = logError('Client initialization failed', error);

    // Return a minimal object for edge runtime compatibility
    return {
      app: null,
      db: null,
      auth: null,
      storage: null,
      error: errorMsg,
    };
  }
}

// For client-side usage
export const clientFirebase = initializeClientFirebase();

// Admin Firebase is only imported when needed and in compatible environments
let adminFirebase;
if (typeof window === 'undefined' && process.env.NEXT_RUNTIME !== 'edge') {
  // Dynamic imports to avoid loading in edge runtime
  const importAdmin = async () => {
    try {
      debugFirebase('Initializing Firebase Admin...');

      // Check for required environment variables
      if (
        !process.env.FIREBASE_PROJECT_ID ||
        !process.env.FIREBASE_CLIENT_EMAIL ||
        !process.env.FIREBASE_PRIVATE_KEY
      ) {
        throw new Error('Missing Firebase Admin credentials in environment variables');
      }

      const { initializeApp, getApps, cert } = await import('firebase-admin/app');
      const { getFirestore } = await import('firebase-admin/firestore');
      const { getStorage } = await import('firebase-admin/storage');
      const { getAuth } = await import('firebase-admin/auth');

      // Initialize Admin Firebase
      function initAdminApp() {
        debugFirebase('Setting up Firebase Admin app');

        if (!getApps().length) {
          try {
            const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

            initializeApp({
              credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
              }),
              storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });

            debugFirebase('Firebase Admin app initialized successfully');
          } catch (error) {
            logError('Failed to initialize Firebase Admin app', error);
            return null;
          }
        } else {
          debugFirebase('Using existing Firebase Admin app');
        }

        const db = getFirestore();
        const auth = getAuth();
        const storage = getStorage();

        debugFirebase('Firebase Admin services initialized');

        return {
          db,
          auth,
          storage,
        };
      }

      return initAdminApp;
    } catch (error) {
      logError('Error importing admin Firebase modules', error);
      return null;
    }
  };

  // Initialize and set adminFirebase
  importAdmin().then(result => {
    adminFirebase = result;
    debugFirebase('Admin Firebase setup complete', { success: !!result });
  });
} else {
  // For environments that can't support admin Firebase
  debugFirebase('Skipping Admin Firebase initialization (running in Edge or client)');
  adminFirebase = null;
}

export { adminFirebase };
