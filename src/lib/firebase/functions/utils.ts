'use server';

import { serverTimestamp } from 'firebase/firestore';
import { getAdminFirebase } from '../firebase-admin';

const { app, db, auth, storage } = getAdminFirebase();

export const getOnboardingData = async () => {
  try {
    const querySnapshot = await db.collection('onboarding').get();
    console.log('Fetched onboarding data:', querySnapshot.docs.length, 'documents');
    const onboardingData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return onboardingData;
  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    throw new Error('Failed to fetch onboarding data');
  }
};

export const getAllDBData = async (collectionName: string) => {
  try {
    const querySnapshot = await db.collection(collectionName).listDocuments();
    console.log('Documents found:', querySnapshot.length);

    // For each document, also fetch its subcollections
    const data = await Promise.all(
      querySnapshot.map(async doc => {
        console.log('Fetching subcollections for document:', doc.id);
        const websites = await doc.collection('websites').listDocuments();
        console.log(
          `Document ID: ${doc.id}, Subcollections:`,
          websites.map(col => col.id)
        );

        return true;
      })
    );

    return data;
  } catch (error) {
    console.error(`Error fetching ${collectionName} data:`, error);
    throw new Error(`Failed to fetch ${collectionName} data`);
  }
};

export const getAllWebsites = async (clientId: string) => {
  try {
    clientId = clientId.trim() || 'ecef84b1-3c4f-4e5c-84ae-8edf07c0ccd4';
    console.log('Fetching websites for client ID:', clientId);
    const querySnapshot = await db
      .collection('onboarding')
      .doc(clientId)
      .collection('websites')
      .listDocuments();
    if (querySnapshot.length === 0) {
      console.warn('No websites found for client ID:', clientId);
      return [];
    }
    console.log('Websites found:', querySnapshot.length);
    const websitesData = await Promise.all(
      querySnapshot.map(async doc => {
        const websiteDoc = await doc.collection('pages').get();
        if (websiteDoc.empty) {
          console.warn('No pages found for website ID:', doc.id);
          return { id: doc.id, pages: [] };
        }
        return {
          id: doc.id,
          pages: websiteDoc.docs.map(page => ({ id: page.id, ...page.data() })),
        };
      })
    );
    return websitesData;
  } catch (error) {
    console.error('Error fetching websites data:', error);
    throw new Error('Failed to fetch websites data');
  }
};

export const getAllCollections = async () => {
  try {
    // Then also add this to the getAllDBData function to see more details:
    const collections = await db.listCollections();
    const collectionIds = collections.map(collection => collection.id);
    console.log('Available collections:', collectionIds);
    return collectionIds;
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw new Error('Failed to fetch collections');
  }
};

// Add this function to test writing to the collection
export const addTestDocument = async () => {
  try {
    const result = await db.collection('onboarding').add({
      test: true,
      createdAt: new Date(),
      message: 'Test document',
    });
    console.log('Added test document with ID:', result.id);
    return result.id;
  } catch (error) {
    console.error('Error adding test document:', error);
    throw error;
  }
};

// Store or update user data in Firestore
export async function manageUserInFirestore(
  user: any,
  additionalData: Record<string, any> = {}
): Promise<void> {
  try {
    const userDocRef = db.collection('users').doc(user.email || user.uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      // Create new user document
      await userDocRef.set({
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
      // Update existing user document
      await userDocRef.update({
        lastLogin: serverTimestamp(),
        ...additionalData,
      });
    }
  } catch (error) {
    console.error('Error managing user in Firestore:', error);
    throw error;
  }
}
