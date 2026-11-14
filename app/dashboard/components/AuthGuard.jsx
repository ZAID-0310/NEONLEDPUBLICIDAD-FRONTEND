'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AutContext'; 

export default function AuthGuard({ children, requiredRole = null }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      setAuthorized(false);
      router.replace('/login');
      return;
    }
    if (requiredRole) {
      const rolesArray = requiredRole.includes(',') 
        ? requiredRole.split(',').map(r => r.trim())
        : [requiredRole];
      const ok = rolesArray.some(r => 
        user?.rol?.toLowerCase() === r.toLowerCase()
      );
      if (!ok) {
        setAuthorized(false);
        router.replace('/dashboard/unauthorized');
        return;
      }
    }
    setAuthorized(true);

  }, [isLoading, isAuthenticated, user, requiredRole, router]);

  if (isLoading || !authorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}