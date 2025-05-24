import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
// Remove the sonner import until we install it
// import { toast } from 'sonner'; 

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate config before initializing
const validateFirebaseConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingFields = requiredFields.filter(
    field => !firebaseConfig[field as keyof typeof firebaseConfig]
  );

  if (missingFields.length > 0) {
    throw new Error(`Missing Firebase configuration fields: ${missingFields.join(', ')}`);
  }

  return true;
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let initError: string | null = null;

try {
  // Only initialize on the client side
  if (typeof window !== 'undefined') {
    // Validate config
    validateFirebaseConfig();

    // Initialize or get existing app
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('[Firebase Client] Initialized new app.');
    } else {
      app = getApp();
      console.log('[Firebase Client] Using existing app.');
    }

    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Set Firestore settings for better performance
    // No settings needed for current version, but can be added here if needed
  }
} catch (error) {
  console.error('[Firebase Client] Initialization failed:', error);
  initError = error instanceof Error ? error.message : String(error);

  // Create dummy objects to prevent null exceptions
  app = null as any;
  auth = null as any;
  db = null as any;
  storage = null as any;

  // Show user-friendly error in UI (without toast for now)
  if (typeof window !== 'undefined') {
    console.error('Failed to connect to database. Please refresh the page or contact support.');
  }
}

// Utility function to check if Firebase is properly initialized
export const isFirebaseInitialized = () => {
  return !!app && !!auth && !!db && !!storage;
};

// Export services and error state
export { app, auth, db, storage, initError };
