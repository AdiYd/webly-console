'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { getAllWebsites } from '@/lib/firebase/functions/utils';

interface WebsiteStats {
  total: number;
  [key: string]: number;
}

interface WebsiteContextType {
  websites: any[];
  loading: boolean;
  stats: WebsiteStats;
  setWebsites: React.Dispatch<React.SetStateAction<any[]>>;
  refresh: () => Promise<void>;
  saveChanges: () => Promise<void>;
}

const WebsiteContext = createContext<WebsiteContextType>({
  websites: [],
  loading: false,
  stats: { total: 0 },
  setWebsites: () => {},
  refresh: async () => {},
  saveChanges: async () => {},
});

export function useWebsiteContext() {
  return useContext(WebsiteContext);
}

const testId = 'ecef84b1-3c4f-4e5c-84ae-8edf07c0ccd4';

export function WebsiteProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [websites, setWebsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<WebsiteStats>({ total: 0 });

  const clientId = testId || session?.user?.id || session?.user?.email || '';
  console.log('Client ID:', clientId);

  // Fetch websites when clientId is available
  const fetchWebsites = async () => {
    if (!clientId) {
      setWebsites([]);
      setStats({ total: 0 });
      return;
    }
    setLoading(true);
    try {
      const data = await getAllWebsites(clientId);
      setWebsites(data);
      setStats({ total: data.length });
    } catch (error) {
      setWebsites([]);
      setStats({ total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  // Save changes to Firestore (stub, implement as needed)
  const saveChanges = async () => {
    // ...implement saving logic if needed
  };

  const values = useMemo(
    () => ({
      websites,
      loading,
      stats,
      setWebsites,
      refresh: fetchWebsites,
      saveChanges,
    }),
    [websites, loading, stats]
  );

  return <WebsiteContext.Provider value={values}>{children}</WebsiteContext.Provider>;
}

export const useWebsite = () => {
  return useContext(WebsiteContext);
};
