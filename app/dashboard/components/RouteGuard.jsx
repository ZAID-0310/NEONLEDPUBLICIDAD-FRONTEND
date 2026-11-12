'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { dashboardLinks } from '@/app/dashboard/dashboardLinks/dashboardLinks';
import AuthGuard from './AuthGuard';

export default function RouteGuard({ children }) {
  const pathname = usePathname();
  const [rolesPermitidos, setRolesPermitidos] = useState(null);

  useEffect(() => {
    const rutaLimpia = pathname.replace(/\/$/, ""); 
    
    const linkEncontrado = dashboardLinks.find(link => link.href === rutaLimpia);
    
    if (linkEncontrado && linkEncontrado.roles) {
      setRolesPermitidos(linkEncontrado.roles.join(','));
    } else {
      
      setRolesPermitidos("todos"); 
    }
  }, [pathname]);

 
  if (rolesPermitidos === null) return null;

  return (
    <AuthGuard requiredRole={rolesPermitidos === "todos" ? null : rolesPermitidos}>
      {children}
    </AuthGuard>
  );
}