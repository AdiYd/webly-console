// Client-side Firebase
import { initializeApp as initializeClientApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore as getClientFirestore } from 'firebase/firestore';
import { getStorage as getClientStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Client Firebase
function initializeClientFirebase() {
  try {
    const app = initializeClientApp(firebaseConfig);
    return {
      app,
      db: getClientFirestore(app),
      auth: getAuth(app),
      storage: getClientStorage(app),
    };
  } catch (error) {
    console.error('Error initializing Firebase client:', error);
    // Return a minimal object for edge runtime compatibility
    return {
      app: null,
      db: null,
      auth: null,
      storage: null
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
      const { initializeApp, getApps, cert } = await import('firebase-admin/app');
      const { getFirestore } = await import('firebase-admin/firestore');
      const { getStorage } = await import('firebase-admin/storage');
      const { getAuth } = await import('firebase-admin/auth');
      
      // Initialize Admin Firebase
      function initAdminApp() {
        if (!getApps().length) {
          initializeApp({
            credential: cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          });
        }
        return {
          db: getFirestore(),
          auth: getAuth(),
          storage: getStorage(),
        };
      }
      
      return initAdminApp;
    } catch (error) {
      console.error('Error importing admin Firebase modules:', error);
      return null;
    }
  };
  
  // Initialize and set adminFirebase
  importAdmin().then(result => {
    adminFirebase = result;
  });
} else {
  // For environments that can't support admin Firebase
  adminFirebase = null;
}

export { adminFirebase };
