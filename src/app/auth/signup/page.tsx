'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import Link from 'next/link';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/firebase-client';
import { fadeInVariants } from '../signin/page';
import { motion } from 'framer-motion';

export default function SignUp() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('error');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dismissError, setDismissError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Handle URL error parameters with enhanced Google-specific errors
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
        case 'GoogleSignUpFailed':
          setError('Failed to sign up with Google. Please try again or use email signup.');
          break;
        case 'EmailAlreadyExists':
          setError('An account with this email already exists. Please sign in instead.');
          break;
        case 'auth/weak-password':
          setError('The password is too weak. Please choose a stronger password.');
          break;
        case 'auth/invalid-email':
          setError('The email address is not valid. Please enter a valid email.');
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

    // Verify passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    // Verify email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;

      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', user.email || user.uid), {
        name,
        email,
        role: 'Trial',
        image: '',
        createdAt: new Date().toISOString(),
        provider: 'credentials',
      });

      setSuccessMessage('Account created successfully! You can now sign in.');
      setIsLoading(false);

      // Signing in the user automatically after signup
      await signIn('credentials', {
        email,
        password,
        redirect: true,
        redirectTo: '/',
        rememberMe: false,
        callbackUrl: '/',
      });
    } catch (error) {
      setIsLoading(false);
      if (error instanceof Error) {
        // Handle specific Firebase errors
        if (error.message.includes('auth/email-already-in-use')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('auth/weak-password')) {
          setError('The password is too weak. Please choose a stronger password.');
        } else {
          setError(`Error creating account: ${error.message}`);
        }
      } else {
        setError('An unknown error occurred. Please try again.');
      }
      console.error('Signup error:', error);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (!db || !auth) {
        throw new Error('Somwething went wrong. Please try again later.');
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Google client: ', user);
      // Check if the user already exists in Firestore
      const userDocRef = doc(db, 'users', user.email || user.uid);
      // await new Promise(resolve => setTimeout(resolve, 800)); // Simulate a delay
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        console.log('Creating new user document in Firestore', user);
        await setDoc(doc(db, 'users', user.email || user.uid), {
          name: user.displayName,
          email: user.email,
          role: 'Trial',
          image: user.photoURL,
          createdAt: new Date().toISOString(),
          provider: 'google',
        });
      }
      setSuccessMessage('Account created successfully! You can now sign in.');
      // Get the Firebase ID token
      const idToken = await user.getIdToken();

      // Sign in to NextAuth using the credentials provider with the ID token
      console.log('Attempting NextAuth sign-in with Firebase ID token');
      await signIn('credentials', {
        idToken: idToken,
        providerType: 'google',
        id: user.uid,
        name: user.displayName,
        email: user.email,
        role: 'Trial',
        image: user.photoURL,
        callbackUrl: '/',
      });
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      console.error('Google Sign-Up/Sign-In process failed', error);
      // Handle Firebase errors (e.g., popup closed, network error)
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        setError(
          'An account already exists with this email using a different sign-in method (e.g., password). Please sign in using that method.'
        );
      } else {
        setError(`Google sign-in failed: ${error.message || 'Unknown error'}`);
      }
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
            className="btn btn-outline w-full flex items-center justify-center gap-2"
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
          <div className="alert alert-error">
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