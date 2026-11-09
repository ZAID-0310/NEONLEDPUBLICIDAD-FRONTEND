'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AutContext'; // <-- Importamos el Contexto

export default function AuthGuard({ children, requiredRole = null }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth(); 

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated === undefined) return;
    if (!isAuthenticated) {
      router.replace('/login');
      setAuthorized(false);
      setLoading(false);
      return;
    }
    if (requiredRole) {
      const rolesArray = requiredRole.includes(',') 
        ? requiredRole.split(',').map(role => role.trim())
        : [requiredRole];
      const hasRequiredRole = rolesArray.some(role => {
        return user?.rol?.toLowerCase() === role.toLowerCase();
      });
      if (!hasRequiredRole) {
        router.replace('/dashboard/unauthorized');
        setAuthorized(false);
        setLoading(false);
        return;
      }
    }
    setAuthorized(true);
    setLoading(false);

  }, [isAuthenticated, user, requiredRole, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}