'use client';

import { useState, useEffect } from 'react';
import { signIn, getProviders } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import Link from 'next/link';
import { clientFirebase } from '@/lib/firebase/firebase';

export default function SignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('error');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [firebaseStatus, setFirebaseStatus] = useState<string>('Checking Firebase status...');

  // Check Firebase configuration on mount
  useEffect(() => {
    console.log('Checking Firebase initialization status...');
    try {
      // Check clientFirebase initialization status
      const fbStatus = {
        appInitialized: !!clientFirebase.app,
        authInitialized: !!clientFirebase.auth,
        dbInitialized: !!clientFirebase.db,
        storageInitialized: !!clientFirebase.storage,
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 5) + '...',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      };

      console.log('Firebase client status:', fbStatus);
      setFirebaseStatus(
        fbStatus.appInitialized && fbStatus.authInitialized
          ? 'Firebase initialized successfully'
          : 'Firebase initialization issues detected'
      );
    } catch (err) {
      console.error('Error checking Firebase status:', err);
      setFirebaseStatus('Error checking Firebase status');
    }

    // Check available auth providers
    const loadProviders = async () => {
      try {
        const providers = await getProviders();
        console.log('Available auth providers:', providers);
        if (!providers?.google) {
          console.warn('Google provider not configured properly');
          setError('Google sign-in is not properly configured');
        }
      } catch (err) {
        console.error('Error loading auth providers:', err);
      }
    };

    // loadProviders();
  }, []);

  // Handle URL error parameters
  useEffect(() => {
    if (errorMessage) {
      console.error('Auth error detected on signup page:', errorMessage);
      switch (errorMessage) {
        case 'OAuthAccountNotLinked':
          setError(
            'This email is already associated with another sign-in method. Please use the original method you signed up with.'
          );
          break;
        case 'Configuration':
          setError('There is a problem with the server authentication configuration.');
          break;
        case 'OAuthCallback':
          setError('There was a problem with Google sign-in. Please try again.');
          break;
        default:
          setError(`Authentication error: ${errorMessage}. Please try again.`);
      }
    }
  }, [errorMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    // ...existing code...
    // Simulate a successful registration
    setTimeout(() => {
      setSuccessMessage('Account created successfully! You can now sign in.');
      setIsLoading(false);
      // Redirect to sign in page after 2 seconds
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    }, 1500);
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setIsLoading(true);

    const callbackUrl = '/';
    console.log('Initiating Google sign-up process...');
    console.log('Using callback URL:', callbackUrl);

    try {
      if (!clientFirebase.app || !clientFirebase.auth) {
        throw new Error('Firebase is not properly initialized');
      }

      const signInParams = {
        callbackUrl,
        redirect: true,
      };

      console.log('Google sign-in parameters:', signInParams);

      setTimeout(async () => {
        try {
          await signIn('google', signInParams);
        } catch (err) {
          console.error('Failed during Google sign-in process:', err);
          setError('Failed to complete Google sign-in process');
          setIsLoading(false);
        }
      }, 100);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Google sign-up initialization error:', error);
      setError(`Failed to initialize Google sign-up: ${errorMsg}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-base-100">
      <div className="w-full max-w-md z-10 space-y-8 bg-base-200 p-8 my-8 shadow-lg rounded-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="mt-2 text-sm text-base-content/70">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Firebase Status Indicator */}
        {firebaseStatus && (
          <div
            className={`text-xs ${
              firebaseStatus.includes('successfully') ? 'text-success' : 'text-warning'
            } flex items-center gap-1`}
          >
            <Icon
              icon={
                firebaseStatus.includes('successfully') ? 'mdi:check-circle' : 'mdi:alert-circle'
              }
              className="h-4 w-4"
            />
            <span>{firebaseStatus}</span>
          </div>
        )}

        <div className="space-y-4">
          <button
            type="button"
            className="btn btn-outline w-full flex items-center justify-center gap-2"
            onClick={handleGoogleSignUp}
            disabled={isLoading || firebaseStatus.includes('issues')}
          >
            <Icon icon="flat-color-icons:google" width="20" height="20" />
            <span>Sign up with Google</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-base-content/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-base-300 px-2 text-base-content/70">Or continue with</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <Icon icon="mdi:close-circle" className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <Icon icon="mdi:check-circle" className="h-5 w-5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Debug info hidden */}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* ...existing code... */}
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={isLoading}
                className="mt-1 block w-full input input-bordered"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
                className="mt-1 block w-full input input-bordered"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
                className="mt-1 block w-full input input-bordered"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="mt-1 block w-full input input-bordered"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input type="checkbox" required className="checkbox checkbox-xs checkbox-primary" />
              <span className="ml-2 text-sm">
                I agree to the{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <Icon icon="mdi:account-plus" />
                <span>Create account</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}