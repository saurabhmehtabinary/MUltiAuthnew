'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authManager } from '@/utils/auth';
import { User } from '@/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: User['role'][];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback,
  redirectTo = '/dashboard'
}: RoleGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkRole = () => {
      const hasRequiredRole = authManager.hasAnyRole(allowedRoles);
      setHasAccess(hasRequiredRole);
      setIsLoading(false);

      if (!hasRequiredRole) {
        router.push(redirectTo);
      }
    };

    checkRole();
  }, [allowedRoles, redirectTo, router]);

  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return null; // Will redirect
  }

  return <>{children}</>;
} 