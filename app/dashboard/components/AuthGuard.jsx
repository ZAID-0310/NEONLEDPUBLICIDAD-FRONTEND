'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AutContext'; 
import { getUserRoleString } from '@/lib/utils/auth'; // Importa el helper

export default function AuthGuard({ children, requiredRole = null }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      if (isLoading) return;

      if (!isAuthenticated) {
        if (isMounted) router.replace('/login');
        return;
      }

     
      if (requiredRole) {
        const currentUserRole = getUserRoleString(user); 
        
        if (!currentUserRole) {
           if (isMounted) router.replace('/dashboard/unauthorized');
           return;
        }
        let requiredRolesList = [];
        
        if (typeof requiredRole === 'string') {
            requiredRolesList = requiredRole.split(',').map(r => r.trim().toLowerCase());
        } else if (Array.isArray(requiredRole)) {
            requiredRolesList = requiredRole.map(r => r.toString().trim().toLowerCase());
        }
        const hasRequiredRole = requiredRolesList.some(reqRole => reqRole === currentUserRole);

        if (!hasRequiredRole) {
          if (isMounted) {
            console.warn(`User role '${currentUserRole}' does not match required '${requiredRole}'`);
            router.replace('/dashboard/unauthorized');
          }
          return;
        }
      }

      if (isMounted) setCanRender(true);
    };

    checkAccess();

    return () => { isMounted = false; };
  }, [isLoading, isAuthenticated, user, requiredRole, router]);

  if (isLoading || !canRender) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}