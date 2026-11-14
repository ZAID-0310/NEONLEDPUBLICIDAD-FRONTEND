import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert className="w-10 h-10 text-red-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
        Acceso Denegado
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
        No tienes los permisos necesarios para ver esta sección. Si crees que es un error, contacta al administrador.
      </p>
      <Link 
        href="/dashboard/main" 
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Volver al Panel Principal
      </Link>
    </div>
  );
}