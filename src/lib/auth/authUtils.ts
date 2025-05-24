import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/firebase-client';
import { signIn } from 'next-auth/react';

// Error message maps for user-friendly error feedback
export const authErrorMessages = {
  'auth/email-already-in-use': 'An account with this email already exists. Please sign in instead.',
  'auth/wrong-password': 'Invalid password. Please try again.',
  'auth/user-not-found': 'No account found with this email address.',
  'auth/weak-password': 'The password is too weak. Please choose a stronger password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
  'auth/too-many-requests': 'Too many failed login attempts. Please try again later.',
  'auth/popup-closed-by-user': 'Sign-in cancelled. Please try again.',
  'auth/account-exists-with-different-credential':
    'An account already exists with this email using a different sign-in method.',
  default: 'Authentication error. Please try again.',
};

// Convert Firebase error code to user-friendly message
export function getAuthErrorMessage(errorCode: string): string {
  return (
    authErrorMessages[errorCode as keyof typeof authErrorMessages] ||
    (errorCode.includes('auth/') ? `Authentication error: ${errorCode}` : authErrorMessages.default)
  );
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Store or update user data in Firestore
export async function manageUserInFirestore(
  user: any,
  additionalData: Record<string, any> = {}
): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', user.email || user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(userDocRef, {
        name: user.displayName || additionalData.name || 'User',
        email: user.email,
        role: additionalData.role || 'Trial',
        image: user.photoURL || additionalData.image || '',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        provider: additionalData.provider || 'credentials',
        ...additionalData,
      });
    } else {
      // Update existing user (could be implemented if needed)
      // Currently not updating existing users to avoid overwriting data
    }
  } catch (error) {
    console.error('Error managing user in Firestore:', error);
    throw error;
  }
}

// Handle Email/Password authentication
export async function emailPasswordAuth(
  email: string,
  password: string,
  isSignUp: boolean = false,
  additionalData: Record<string, any> = {}
): Promise<UserCredential> {
  // Validate email
  if (!validateEmail(email)) {
    throw new Error('auth/invalid-email');
  }

  // Perform Firebase authentication
  const authFunction = isSignUp ? createUserWithEmailAndPassword : signInWithEmailAndPassword;

  const userCredential = await authFunction(auth, email, password);

  // Store user in Firestore if signing up
  if (isSignUp) {
    await manageUserInFirestore(userCredential.user, additionalData);
  }

  return userCredential;
}

// Handle Google authentication
export async function googleAuth(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  // Store user in Firestore
  await manageUserInFirestore(result.user, {
    provider: 'google',
  });

  return result;
}

// Complete NextAuth sign-in after Firebase authentication
export async function completeNextAuthSignIn(
  userCredential: UserCredential,
  options: Record<string, any> = {}
): Promise<void> {
  const user = userCredential.user;

  try {
    // Get user data from Firestore
    const userDocRef = doc(db, 'users', user.email || user.uid);
    const userDoc = await getDoc(userDocRef);

    // Prepare user data for NextAuth
    let userData = {
      id: user.uid,
      name: user.displayName || '',
      email: user.email || '',
      image: user.photoURL || '',
      role: 'Trial',
      provider: options.provider || 'credentials',
    };

    // Add Firestore data if available
    if (userDoc.exists()) {
      const firestoreData = userDoc.data();
      userData = {
        ...userData,
        name: firestoreData.name || userData.name,
        image: firestoreData.image || userData.image,
        role: firestoreData.role || userData.role,
      };
    }

    // Complete sign-in with NextAuth
    await signIn('credentials', {
      ...userData,
      ...options,
      redirect: options.redirect !== false,
      callbackUrl: options.callbackUrl || '/',
    });
  } catch (error) {
    console.error('Error completing NextAuth sign-in:', error);
    throw error;
  }
}
