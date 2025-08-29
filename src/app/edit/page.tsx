'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import FireDots from '@/components/ui/fireFlies/firedots';
import { useTheme } from '@/context/theme-provider';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { db } from '@/lib/firebase/firebase-client';
import { any } from 'zod';
import { collection, doc, getDocs } from 'firebase/firestore';
import {
  getAllCollections,
  getAllDBData,
  getAllWebsites,
  getOnboardingData,
} from '@/lib/firebase/functions/utils';
import { Editor, EditorProvider } from '@/editor';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, isDarkTheme, isLoading } = useTheme();
  const { data: session } = useSession();
  useEffect(() => {
    // checkDatabaseConnection();
    // Set mounted to true after the component has mounted
    setIsMounted(true);
  }, []);

  const checkDatabaseConnection = async () => {
    try {
      const clientId = 'ecef84b1-3c4f-4e5c-84ae-8edf07c0ccd4'; // Example client ID
      const websites = await getAllWebsites(clientId);
      console.log('Websites fetched successfully:', websites);
    } catch (error) {
      console.error('Error checking database connection:', error);
      return false;
    }
  };

  // Prevent rendering on server-side to avoid hydration issues
  if (!isMounted || isLoading) {
    return null;
  }

  return (
    <EditorProvider>
      <Editor />
    </EditorProvider>
  );
}

export async function getWebPagesFromDB(clientId: string, websiteId: string): Promise<Array<any>> {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }
    if (!clientId) {
      throw new Error('Client ID is required to fetch web pages');
    }
    const webPages: Array<any> = [];
    // Get the collection reference
    const collectionRef = collection(db, `onboarding`);

    const snapshot = await getDocs(collectionRef);
    snapshot.forEach(doc => {
      const webPageData = doc.data();
      webPages.push(webPageData);
    });
    console.log('Fetched web pages:', webPages);
    return webPages;
  } catch (error) {
    console.error('Error fetching web pages:', error);
    return [];
  }
}
