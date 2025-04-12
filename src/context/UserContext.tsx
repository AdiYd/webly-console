'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useBoolean } from '../hooks/use-boolean';

// Define user data interface
export interface UserData {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role?: string;
  preferences?: {
    theme?: string;
    notifications?: boolean;
    [key: string]: any;
  };
  metadata?: Record<string, any>;
}

// Define context interface
interface UserContextType {
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  updateUserPreference: (key: string, value: any) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Props for the provider component
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  // Use session from NextAuth
  const { data: session, status } = useSession();
  
  // State variables
  const [user, setUser] = useState<UserData | null>(null);
  const { value: isLoading, setTrue: startLoading, setFalse: stopLoading } = useBoolean(true);

  // Check if the user is authenticated
  const isAuthenticated = !!user;

  // Fetch user data when session changes
  useEffect(() => {
    const fetchUserData = async () => {
      // Only try to fetch user data if session is authenticated
      if (status === 'loading') {
        // Wait for session to be determined
        return;
      }
      
      if (session?.user?.email) {
        startLoading();
        try {
          console.log("Session found, setting user data");
          // Here you would typically fetch additional user data from your database
          const userData: UserData = {
            id: session.user.id || session.user.email,
            email: session.user.email,
            name: session.user.name || undefined,
            image: session.user.image || undefined,
            // Add any additional fields from your database
          };
          
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setUser(null);
        } finally {
          stopLoading();
        }
      } else {
        console.log("No session found, clearing user data");
        setUser(null);
        stopLoading();
      }
    };

    fetchUserData();
  }, [session, status, startLoading, stopLoading]);

  // Update user data
  const updateUserData = async (data: Partial<UserData>) => {
    if (!user) return;
    
    startLoading();
    try {
      // Here you would update the user data in your database
      // For example:
      // await updateUserInDatabase(user.id, data);
      
      // Update local state
      setUser((prev) => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error("Failed to update user data:", error);
      throw error;
    } finally {
      stopLoading();
    }
  };

  // Update user preference
  const updateUserPreference = async (key: string, value: any) => {
    if (!user) return;
    
    startLoading();
    try {
      // Here you would update the user preferences in your database
      // For example:
      // await updateUserPreferenceInDatabase(user.id, key, value);
      
      // Update local state
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          preferences: {
            ...prev.preferences,
            [key]: value
          }
        };
      });
    } catch (error) {
      console.error("Failed to update user preference:", error);
      throw error;
    } finally {
      stopLoading();
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (!user?.id) return;
    
    startLoading();
    try {
      // Here you would fetch the latest user data from your database
      // For example:
      // const freshUserData = await fetchUserFromDatabase(user.id);
      // setUser(freshUserData);
      
      console.log("Refreshing user data");
      // For now, just stop loading
      stopLoading();
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      stopLoading();
    }
  };

  const contextValue: UserContextType = {
    user,
    isLoading: isLoading || status === 'loading',
    isAuthenticated,
    updateUserData,
    updateUserPreference,
    refreshUserData,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;