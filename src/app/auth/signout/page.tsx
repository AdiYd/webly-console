'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icon';

export default function SignOut() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Redirect to home after countdown
      router.push('/');
    }
  }, [countdown, router]);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/' });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-base-200">
      <div className="w-full max-w-md space-y-8 bg-base-100 p-8 shadow-lg rounded-xl text-center">
        <div>
          <div className="text-warning mx-auto mb-4">
            <Icon icon="mdi:logout" className="h-20 w-20 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold">Sign Out</h1>
          <p className="mt-4">Are you sure you want to sign out?</p>
        </div>

        <div className="space-y-4 pt-4">
          <button
            onClick={handleSignOut}
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <Icon icon="mdi:check-circle" />
                <span>Yes, Sign Out</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleCancel}
            className="btn btn-outline w-full"
          >
            <Icon icon="mdi:close-circle" className="mr-2" />
            <span>Cancel</span>
          </button>
          
          <p className="text-sm text-gray-500 pt-4">
            <Icon icon="mdi:timer-outline" className="inline mr-1" />
            You will be redirected to the home page in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
}