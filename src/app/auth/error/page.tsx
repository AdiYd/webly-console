'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon'; 

// Error messages for common NextAuth errors
const errorMessages: Record<string, string> = {
  'Configuration': 'There is a problem with the server configuration. Please contact support.',
  'AccessDenied': 'You do not have permission to sign in.',
  'Verification': 'The verification link may have been expired or already used.',
  'OAuthSignin': 'Error in the OAuth sign-in process.',
  'OAuthCallback': 'Error in the OAuth callback process.',
  'OAuthCreateAccount': 'Could not create OAuth provider account.',
  'EmailCreateAccount': 'Could not create email provider account.',
  'Callback': 'Error in the OAuth callback handler.',
  'OAuthAccountNotLinked': 'This email is already associated with another account.',
  'EmailSignin': 'The e-mail could not be sent.',
  'CredentialsSignin': 'The email or password you entered is incorrect.',
  'SessionRequired': 'You must be signed in to access this page.',
  'Default': 'An unknown error occurred.'
};

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error') || 'Default';
  
  // Use the error code to get the appropriate message
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-base-200">
      <div className="w-full max-w-md space-y-8 bg-base-100 p-8 shadow-lg rounded-xl text-center">
        <div>
          <div className="text-error mx-auto mb-4">
            <Icon icon="mdi:alert-circle" className="h-20 w-20 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold">Authentication Error</h1>
          <div className="alert alert-error mt-6">
            <p>{errorMessage}</p>
          </div>
        </div>
        
        <div className="space-y-4 pt-6">
         <button
            onClick={() => window.location.reload()}
            className="btn btn-primary w-full"
            disabled={false} // You can set this based on your loading state
          >
            <Icon icon="mdi:refresh" className="mr-2" />
            Try Again
          </button>
          
          <button className="btn btn-secondary w-full"> {/* Added class for styling */}
            <Link href="/">
              <Icon icon="mdi:home" className="mr-2" />
              Go to Homepage
            </Link>
          </button>
        </div>
      </div>
    </div>
  );
}