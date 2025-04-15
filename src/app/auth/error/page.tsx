'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [errorDetails, setErrorDetails] = useState({
    title: 'Authentication Error',
    message: 'An error occurred during authentication.',
    suggestion: 'Please try again or contact support if the issue persists.',
    icon: 'mdi:alert-circle',
    severity: 'error',
  });

  useEffect(() => {
    // Map error codes to user-friendly messages
    if (error) {
      switch (error) {
        case 'Configuration':
          setErrorDetails({
            title: 'Server Configuration Issue',
            message: 'There is a problem with the authentication server configuration.',
            suggestion: 'Please try again later or contact the system administrator.',
            icon: 'mdi:cog-off',
            severity: 'error',
          });
          break;
        case 'AccessDenied':
          setErrorDetails({
            title: 'Access Denied',
            message: 'You do not have permission to sign in.',
            suggestion: 'Please contact your administrator if you believe this is a mistake.',
            icon: 'mdi:lock',
            severity: 'error',
          });
          break;
        case 'Verification':
          setErrorDetails({
            title: 'Verification Required',
            message: 'Your email verification link has expired or is invalid.',
            suggestion: 'Please request a new verification email.',
            icon: 'mdi:email-check',
            severity: 'warning',
          });
          break;
        case 'OAuthAccountNotLinked':
          setErrorDetails({
            title: 'Account Already Exists',
            message: 'An account already exists with this email using a different sign-in method.',
            suggestion: 'Please sign in using the original method you used to create your account.',
            icon: 'mdi:account-multiple',
            severity: 'warning',
          });
          break;
        case 'OAuthSignin':
        case 'OAuthCallback':
          setErrorDetails({
            title: 'Social Sign In Failed',
            message: 'There was a problem signing in with the social provider.',
            suggestion: 'Please try again or use a different sign-in method.',
            icon: 'mdi:google',
            severity: 'error',
          });
          break;
        case 'ClientFetchError':
          setErrorDetails({
            title: 'Connection Error',
            message: 'Unable to communicate with the authentication server.',
            suggestion: 'Please check your internet connection and try again.',
            icon: 'mdi:wifi-off',
            severity: 'error',
          });
          break;
        case 'RequestAsyncStorage':
        case 'HeadersError':
          setErrorDetails({
            title: 'Authentication System Error',
            message: 'There was a technical issue with the authentication process.',
            suggestion:
              'Please try signing in again using the standard sign-in form instead of alternative methods.',
            icon: 'mdi:server-off',
            severity: 'warning',
          });
          break;
        case 'SessionTokenError':
          setErrorDetails({
            title: 'Session Error',
            message: 'There was a problem with your session.',
            suggestion: 'Please try signing in again to refresh your session.',
            icon: 'mdi:cookie-off',
            severity: 'warning',
          });
          break;
        default:
          setErrorDetails({
            title: `Authentication Error`,
            message: `${
              error || 'An unexpected error occurred during the authentication process.'
            }`,
            suggestion: 'Please try again or use a different sign-in method.',
            icon: 'mdi:alert-circle',
            severity: 'error',
          });
      }
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-base-200 p-8 shadow-lg rounded-xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div
              className={`rounded-full flex justify-center  ${
                errorDetails.severity === 'error'
                  ? 'bg-error/10 text-error'
                  : 'bg-warning/10 text-warning'
              } p-2`}
            >
              <Icon icon={errorDetails.icon} width={40} height={40} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-base-content">{errorDetails.title}</h1>

          <div
            className={`alert ${
              errorDetails.severity === 'error' ? 'alert-error' : 'alert-warning'
            } mt-4 shadow-md`}
          >
            <p className="text-sm">{errorDetails.message}</p>
          </div>

          <p className="mt-4 text-sm text-base-content/70">{errorDetails.suggestion}</p>
        </div>

        <div className="flex flex-col gap-3 mt-8">
          <Link href="/auth/signin" className="btn btn-primary w-full">
            <Icon icon="mdi:login" className="h-5 w-5 mr-2" />
            Back to Sign In
          </Link>

          <Link href="/" className="btn btn-outline w-full">
            <Icon icon="mdi:home" className="h-5 w-5 mr-2" />
            Go to Home Page
          </Link>
        </div>

        {error && (
          <div className="mt-6 text-xs text-center">
            <p className="text-base-content/50">Error code: {error}</p>
            <p className="text-base-content/50 mt-1">
              If this problem persists, please contact support with this error code.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}