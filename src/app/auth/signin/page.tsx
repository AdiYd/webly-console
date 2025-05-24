'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import Link from 'next/link';
import {
  emailPasswordAuth,
  googleAuth,
  completeNextAuthSignIn,
  getAuthErrorMessage,
} from '@/lib/auth/authUtils';
import { motion } from 'framer-motion';

export const fadeInVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

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
  const [successMessage, setSuccessMessage] = useState('');
  const [dismissError, setDismissError] = useState(false);

  // Handle URL error parameters
  useEffect(() => {
    if (errorMessage) {
      console.error('Auth error detected:', errorMessage);

      switch (errorMessage) {
        case 'OAuthAccountNotLinked':
          setError(
            'This email is already associated with another sign-in method. Please use the original method you signed up with.'
          );
          break;
        case 'AccessDenied':
          setError('Access denied. You may not have permission to sign in.');
          break;
        case 'Verification':
          setError('Email verification required. Please verify your email first.');
          break;
        case 'Configuration':
          setError('There is a problem with the server authentication configuration.');
          break;
        case 'OAuthCallback':
        case 'OAuthSignin':
          setError('There was a problem with the Google sign-in process. Please try again.');
          break;
        case 'GoogleSignInFailed':
          setError('Failed to sign in with Google. Your account may not be registered.');
          break;
        default:
          setError(`Authentication error: ${errorMessage}. Please try again.`);
      }
    }
  }, [errorMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDismissError(false);
    setSuccessMessage('');
    setIsLoading(true);

    try {
      // Authenticate with Firebase
      const userCredential = await emailPasswordAuth(
        formData.email,
        formData.password,
        false // isSignUp = false
      );

      // Complete authentication with NextAuth
      await completeNextAuthSignIn(userCredential, {
        rememberMe: formData.rememberMe,
        callbackUrl,
        provider: 'credentials',
      });

      setSuccessMessage('Sign in successful');

      // Router redirect will happen after NextAuth redirect
    } catch (error: any) {
      const errorCode = error.code || 'default';
      setError(getAuthErrorMessage(errorCode));
      console.error('Sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setDismissError(false);
    setSuccessMessage('');
    setIsLoading(true);

    try {
      // Authenticate with Google through Firebase
      const userCredential = await googleAuth();

      // Complete authentication with NextAuth
      await completeNextAuthSignIn(userCredential, {
        provider: 'google',
        callbackUrl,
      });

      setSuccessMessage('Sign in with Google successful');

      // Router redirect will happen after NextAuth redirect
    } catch (error: any) {
      const errorCode = error.code || 'default';
      setError(getAuthErrorMessage(errorCode));
      console.error('Google sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      transition={{ duration: 0.5 }}
      {...fadeInVariants}
      className="flex min-h-screen flex-col items-center mt-4 justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="card w-full max-w-md z-10 space-y-8 p-8 pt-6 max-sm:px-5 shadow-lg">
        <div className="text-center">
          <Icon
            icon="mdi:lock"
            width={20}
            height={20}
            className="rounded-full p-3 bg-gradient-to-br from-base-200/80 to-base-200/20 mx-auto"
          />
          <h1 className="text-2xl font-bold">Sign in to your account</h1>
          <p className="mt-2 text-sm text-base-content/70">
            Or{' '}
            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
              create a new account
            </Link>
          </p>
        </div>

        {error && !dismissError && (
          <div className="alert alert-error !mt-2">
            <Icon
              icon="mdi:close-circle"
              className="h-5 w-5 cursor-pointer"
              onClick={() => setDismissError(true)}
            />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success !mt-2">
            <Icon icon="mdi:check-circle" className="h-5 w-5" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="space-y-4">
          <button
            type="button"
            className="btn btn-outline w-full flex items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Icon icon="flat-color-icons:google" width="20" height="20" />
            <span>Sign in with Google</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-base-content/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-base-100 px-2 text-base-content/70">Or continue with</span>
            </div>
          </div>
        </div>

        <form suppressHydrationWarning onSubmit={handleSubmit} className="space-y-6">
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
        </form>
      </div>
    </motion.div>
  );
}