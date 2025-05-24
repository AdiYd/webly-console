'use client';
import { Icon } from '@iconify/react';
import Head from 'next/head';

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Account - Hello World</title>
      </Head>

      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="card bg-base-100 shadow-xl w-full max-w-md">
          <div className="card-body items-center text-center">
            <Icon icon="mdi:earth" className="text-6xl text-primary mb-4" />
            <h1 className="card-title text-3xl font-bold">Hello World!</h1>
            <p className="py-4 text-base-content">
              Welcome to your account page. This is a simple hello world example.
            </p>
            <div className="card-actions">
              <button className="btn btn-primary">
                <Icon icon="mdi:hand-wave" className="mr-2" />
                Say Hello
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
