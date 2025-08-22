'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import Link from 'next/link';
import {
  emailPasswordAuth,
  googleAuth,
  completeNextAuthSignIn,
  getAuthErrorMessage,
} from '@/lib/auth/authUtils';
import { fadeInVariants } from '../signin/page';
import { motion } from 'framer-motion';

export default function SignUp() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dismissError, setDismissError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Handle URL error parameters
  useEffect(() => {
    if (errorMessage) {
      console.error('Auth error detected on signup page:', errorMessage);
      setError(getAuthErrorMessage(errorMessage));
    }
  }, [errorMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDismissError(false);
    setSuccessMessage('');

    // Verify passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Create user with Firebase Auth
      const userCredential = await emailPasswordAuth(
        email,
        password,
        true, // isSignUp = true
        { name, provider: 'credentials' }
      );

      // Complete authentication with NextAuth
      await completeNextAuthSignIn(userCredential, {
        callbackUrl,
        name,
      });

      setSuccessMessage('Account created successfully! Redirecting...');
    } catch (error: any) {
      const errorCode = error.code || 'default';
      setError(getAuthErrorMessage(errorCode));
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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

      setSuccessMessage('Account created with Google successfully! Redirecting...');
    } catch (error: any) {
      const errorCode = error.code || 'default';
      setError(getAuthErrorMessage(errorCode));
      console.error('Google sign-up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      {...fadeInVariants}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen flex-col items-center justify-center py-12 mt-4 px-4 sm:px-6 lg:px-8"
    >
      <div className="w-full max-w-md z-10 space-y-8 card p-8 pt-6 max-sm:px-5 my-8 shadow-lg">
        <div className="text-center">
          <Icon
            icon="mdi:account"
            width={25}
            height={25}
            className="rounded-full p-3 bg-gradient-to-br from-base-200/80 to-base-200/20 mx-auto"
          />
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="mt-2 text-sm text-base-content/70">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            className="btn bg-base-content text-base-100 hover:bg-base-content/80 w-full flex items-center justify-center gap-2"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
          >
            <Icon icon="flat-color-icons:google" width="20" height="20" />
            <span>Sign up with Google</span>
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

        {error && !dismissError && (
          <div className="alert alert-error !mt-2">
            <Icon
              onClick={() => setDismissError(true)}
              icon="mdi:close-circle"
              className="h-5 w-5 cursor-pointer hover:opacity-80 relative -bottom-0.5"
            />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <Icon icon="mdi:check-circle" className="h-5 w-5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
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
              <input
                name="terms"
                checked={terms}
                type="checkbox"
                required
                className="checkbox checkbox-xs checkbox-primary"
                onChange={e => setTerms(e.target.checked)}
              />
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
          <button type="submit" className="btn btn-primary w-full" disabled={isLoading || !terms}>
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
    </motion.div>
  );
}