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

interface FeatureCardProps {
  title: string;
  description: string;
  btnColor?: string;
  icon: string;
  href: string;
}

function FeatureCard({
  title,
  description,
  icon,
  btnColor = 'btn-primary',
  href,
}: FeatureCardProps) {
  return (
    <div className="card bg-base-100/70 backdrop-blur-md shadow-md hover:shadow-lg transition-shadow border border-base-300">
      <div className="card-body p-6">
        <div className="flex items-center mb-4">
          <div className=" mr-4 flex items-center justify-center rounded-full /10">
            <Icon icon={icon} width={40} />
          </div>
          <h3 className="card-title text-xl text-start font-bold">{title}</h3>
        </div>
        <p>{description}</p>
        <div className="card-actions justify-end mt-4">
          <Link href={href} className="w-full md:w-auto">
            <button className={`btn btn-sm ${btnColor}`}>Try Now</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, isDarkTheme, isLoading } = useTheme();
  const { data: session } = useSession();

  useEffect(() => {
    checkDatabaseConnection();
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
    <div className="">
      {(isDarkTheme || theme === 'aqua') && <FireDots particleNum={30} particleBaseSize={17} />}
      {/* Hero Section */}
      <section className="hero py-20 ">
        <div className="hero-content text-center">
          <div className="max-w-md md:max-w-3xl">
            <h1 className="text-4xl md:text-6xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold mb-6">
              Your AI-Powered Platform
            </h1>
            <p className="text-xl md:text-2xl mb-10 opacity-80">
              Unlock the power of AI to enhance your development and creative learning. create
              personalized assets, and get instant feedback on your work.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/chat">
                <button className="btn btn-primary">Start Chatting</button>
              </Link>
              <Link href="/chat">
                <button className="btn btn-accent btn-outline">Generate Exercises</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">AI-Powered Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Website Generator"
              description="Create stunning websites in minutes with our AI-powered website generator. Just provide your requirements, and let the AI do the rest."
              icon="proicons:chat"
              btnColor="btn-primary"
              href="/chat"
            />
            <FeatureCard
              title="Coming Soon: Math exercises generator"
              description="Get help with math exercises with AI-powered suggestions and improvements."
              icon="md:document-text"
              btnColor="btn-accent"
              href="#"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pt-8 pb-16 ">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of students and educators who are already using our AI-powered tools to
            enhance their learning experience.
          </p>
          <Link href="/chat">
            <button className="btn btn-accent btn-outline">Try Now for Free</button>
          </Link>
        </div>
      </section>
    </div>
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
