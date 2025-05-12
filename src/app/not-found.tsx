import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function NotFound() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <Icon icon="mdi:emoticon-sad-outline" className="text-9xl mx-auto mb-8 text-primary" />
          <h1 className="text-5xl font-bold">Oops!</h1>
          <p className="py-6 text-2xl">404 - Page Not Found</p>
          <p className="mb-8">
            The page you are looking for might have been removed, had its name changed, or is
            temporarily unavailable.
          </p>
          <Link href="/" className="btn btn-primary">
            <Icon icon="mdi:home" className="mr-2 h-5 w-5" />
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
