'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import Link from 'next/link';
import { clientFirebase } from '@/lib/firebase/firebase';
import { signIn } from 'next-auth/react';

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const errorMessage = searchParams.get('error');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState('');

  // Check Firebase initialization on mount
  useEffect(() => {
    try {
      const fbStatus = {
        appInitialized: !!clientFirebase.app,
        authInitialized: !!clientFirebase.auth,
        error: clientFirebase.error,
      };

      console.log('%c[Firebase Status]', 'color: lightpurple;', fbStatus);

      setFirebaseStatus(
        fbStatus.error
          ? 'Firebase initialization issues detected'
          : 'Firebase initialized successfully'
      );
    } catch (err) {
      console.error('Error checking Firebase status:', err);
    }
  }, []);

  // Handle URL error parameters
  useEffect(() => {
    if (errorMessage) {
      const errorDetails = {
        error: errorMessage,
        callbackUrl,
        referrer: document.referrer,
      };

      console.error('Auth error detected:', errorDetails);
      setDebugInfo(JSON.stringify(errorDetails, null, 2));

      switch (errorMessage) {
        case 'OAuthAccountNotLinked':
          setError(
            'This email is already associated with another sign-in method. Please use the original method you signed up with.'
          );
          break;
        case 'AccessDenied':
          setError(
            'Access denied. You may not have permission to sign in or the request was denied.'
          );
          break;
        case 'Verification':
          setError('Email verification required. Please verify your email first.');
          break;
        case 'Configuration':
          setError(
            'There is a problem with the server authentication configuration. Please try again later.'
          );
          break;
        case 'OAuthCallback':
          setError('There was a problem with the Google sign-in process. Please try again.');
          break;
        case 'OAuthSignin':
          setError('Could not initiate Google sign-in. Please try again later.');
          break;
        default:
          setError(`Authentication error: ${errorMessage}. Please try again or contact support.`);
      }
    }
  }, [errorMessage, callbackUrl]);

  // Updated handleSubmit function with improved error handling and UX

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      console.log('Submitting sign-in form...', formData);
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        rememberMe: formData.rememberMe,
        callbackUrl: callbackUrl || '/',
      });
      console.log('Sign-in result:', result);

      if (result?.error) {
        setError(
          result.error === 'CredentialsSignin'
            ? 'Invalid email or password'
            : `Authentication error: ${result.error}`
        );
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        router.push(callbackUrl || '/');
      } else {
        setIsLoading(false);
      }

      return result;
    } catch (err) {
      console.error('Error during sign-in:', err);
      setIsLoading(false);
      setError('An error occurred during sign-in. Please try again.');
      throw err;
    }
  };

  // Update Google sign-in to use nextAuthSignIn
  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    console.log('Initiating Google sign-in process...');
    console.log('Callback URL:', callbackUrl);

    try {
      // Using the nextAuthSignIn function for Google authentication
      await signIn('google', {
        callbackUrl: callbackUrl || '/home',
      });
      // The code below won't execute due to the redirect
      console.log('Google sign-in initiated successfully');
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Failed to initialize Google sign-in');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-base-100">
      <div className="w-full max-w-md z-10 space-y-8 bg-base-200 p-8 shadow-lg rounded-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign in to your account</h1>
          <p className="mt-2 text-sm text-base-content/70">
            Or{' '}
            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
              create a new account
            </Link>
          </p>
        </div>

        {/* Firebase Status Indicator */}
        {firebaseStatus && (
          <div
            className={`text-xs items-baseline ${
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

        {error && (
          <div className="alert alert-error">
            <Icon icon="mdi:close-circle" className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {debugInfo && showDebug && (
          <div className="mt-2 p-3 bg-base-300 rounded text-xs overflow-auto max-h-32">
            <pre>{debugInfo}</pre>
          </div>
        )}

        {errorMessage && (
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs text-base-content/50 hover:text-primary"
          >
            {showDebug ? 'Hide debug info' : 'Show debug info'}
          </button>
        )}

        <form suppressHydrationWarning onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md">
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
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
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
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
                className="mt-1 block w-full input input-bordered"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                className="checkbox checkbox-xs checkbox-primary"
                checked={formData.rememberMe}
                onChange={e => setFormData({ ...formData, rememberMe: e.target.checked })}
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-primary hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <button type="submit" className="w-full btn btn-primary" disabled={isLoading}>
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <Icon icon="mdi:login" />
                  <span>Sign in</span>
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-base-content"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-base-200 px-2 text-base-content/70">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-outline w-full flex items-center justify-center space-x-2"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Icon icon="flat-color-icons:google" width="20" height="20" />
              <span>Sign in with Google</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}