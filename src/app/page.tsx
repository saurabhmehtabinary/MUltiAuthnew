'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authManager } from '@/utils/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = authManager.isAuthenticated();
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Multi-Tenant Application
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
}
