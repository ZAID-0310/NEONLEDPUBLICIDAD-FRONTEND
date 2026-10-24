"use client";
import Link from "next/link";
import AuthGuard from "./components/AuthGuard";
import auth_service from "./users/services/auth.service";
import { usePathname, useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { useState, useEffect } from "react";
import { DisplayNameContext } from "./components/DisplayNameContext";
import { safeJsonParse } from "@/lib/safe-json";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";

import {
  User,
  LogOut,
  Sun,
  Moon,
  Home,
  Users,
  MessageSquare,
  AlertCircle,
  FileText,
  Settings,
  Mail,
  UserRoundPen,
  BookText,
} from "lucide-react";
import { dashboardLinks } from "./dashboardLinks/dashboardLinks";
import Image from "next/image";

export default function RootLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  // Info usuario y rol
  const userRole = getCookie("rol") || "Usuario";
  const userData = safeJsonParse(getCookie("user"), { name: "Usuario" });
  const empleadoData = safeJsonParse(getCookie("empleado"), null);

  const [displayName, setDisplayName] = useState(
    empleadoData?.nombre || userData?.name || "Usuario",
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Mapa de rutas con roles permitidos
  const routeRolesMap = {
    "/dashboard/empleados": ["administrador"],
    "/dashboard/role-permission": ["administrador"],
    "/dashboard/productos": ["administrador"],
    "/dashboard/contactos": ["administrador", "marketing"],
    "/dashboard/modales": ["administrador", "marketing"],
    "/dashboard/reclamaciones": ["administrador", "marketing", "ventas"],
    "/dashboard/blogs": ["administrador", "marketing"],
    "/dashboard/metrics": ["administrador", "marketing"],
    "/dashboard/clientes": ["administrador", "marketing", "ventas"],
    "/dashboard/propuestas": ["administrador", "marketing", "ventas"],
    "/dashboard/whatsapp": ["administrador", "marketing", "ventas"],
    "/dashboard/user-client": ["cliente"],
  };

  // Verificar si puede acceder a la ruta actual
  useEffect(() => {
    const currentRole = auth_service.getCurrentRole()?.toLowerCase();

    // Admin puede todo
    if (currentRole === "administrador") {
      setIsAuthorized(true);
      return;
    }

    // Verificar si la ruta actual requiere algún rol específico
    let requiredRoles = null;
    for (const [route, roles] of Object.entries(routeRolesMap)) {
      if (pathname.startsWith(route)) {
        requiredRoles = roles;
        break;
      }
    }

    // Si no requiere roles específicos, permitir acceso
    if (!requiredRoles) {
      setIsAuthorized(true);
      return;
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    if (!requiredRoles.includes(currentRole)) {
      setIsAuthorized(false);
      router.push("/dashboard/main");
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  // Efecto para el tema
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
    document.documentElement.classList.toggle("dark", savedMode);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await auth_service.logout();
      setTimeout(() => auth_service.logoutClient(router), 350);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setTimeout(() => auth_service.logoutClient(router), 1000);
    }
  };

  const getSectionName = () => {
    // next.config.mjs tiene trailingSlash: true, así que usePathname()
    // devuelve rutas con "/" al final (ej. "/dashboard/main/")
    const normalizedPathname =
      pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;

    const matchedLink = dashboardLinks.find(
      (link) =>
        link.href === normalizedPathname &&
        (!link.role || link.role === userRole),
    );
    if (matchedLink) return matchedLink.title;

    if (normalizedPathname === "/dashboard/main") return "Panel Principal";
    const section = normalizedPathname.slice(
      normalizedPathname.indexOf("/", 1) + 1,
    );
    return (
      section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, " ")
    );
  };

  // Función para verificar si un link debe mostrarse según el rol
  const shouldShowLink = (link) => {
    const currentRole = auth_service.getCurrentRole()?.toLowerCase();

    // Si tiene roles definidos (nuevo formato)
    if (link.roles) {
      return link.roles.includes(currentRole);
    }

    // Si tiene role (formato antiguo)
    if (link.role && !auth_service.hasRole(link.role)) {
      return false;
    }

    // Si tiene permission
    if (link.permission && !auth_service.hasPermission(link.permission)) {
      return false;
    }

    // Si requiere cuenta verificada
    if (link.requiresVerifiedAccount && !auth_service.isVerifiedAccount()) {
      return false;
    }

    return true;
  };

  // Si no está autorizado, no renderizar nada mientras redirige
  if (!isAuthorized) {
    return null;
  }

  return (
    <DisplayNameContext.Provider
      value={{ displayName, updateDisplayName: setDisplayName }}
    >
      <AuthGuard>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
          {/* Sidebar */}
          <aside
            onMouseEnter={() => setSidebarOpen(true)}
            onMouseLeave={() => setSidebarOpen(false)}
            className={`${
              isSidebarOpen ? "w-64" : "w-20"
            } transition-all duration-300 fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg`}
          >
            {/* Logo and brand */}
            <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
              <Link href="/" className="flex items-center overflow-hidden">
                <Image
                  src="/dashboard/main-icon.svg"
                  alt="Logo"
                  className="h-8 w-8 flex-shrink-0"
                  width={200}
                  height={300}
                />
                <span
                  className={`ml-2 text-lg font-semibold text-blue-primary dark:text-white whitespace-nowrap transition-all duration-300 ${
                    isSidebarOpen
                      ? "opacity-100 max-w-xs"
                      : "opacity-0 max-w-0 ml-0"
                  }`}
                >
                  Neon Led Publicidad
                </span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <ul className="space-y-1 whitespace-nowrap">
                {dashboardLinks.map((link) => {
                  if (!shouldShowLink(link)) return null;

                  const Icon = link.icon;

                  return (
                    <NavLink
                      key={link.href}
                      href={link.href}
                      title={link.title}
                      icon={<Icon className="h-5 w-5" />}
                      isCollapsed={!isSidebarOpen}
                      isActive={pathname.includes(link.href)}
                    />
                  );
                })}
              </ul>
            </nav>

            {/* User profile and dark mode toggle */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {isSidebarOpen ? (
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-primary flex items-center justify-center text-white">
                        <User className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {userRole}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={toggleDarkMode}
                      className="btn-ghost-safe p-2 rounded-md"
                      type="button"
                    >
                      {darkMode ? (
                        <Sun className="h-5 w-5" />
                      ) : (
                        <Moon className="h-5 w-5" />
                      )}
                    </button>

                    <button
                      onClick={() => setLogoutDialogOpen(true)}
                      disabled={isLoggingOut}
                      className="btn-safe flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-primary hover:bg-blue-dark transition-colors disabled:opacity-70"
                      type="button"
                    >
                      {isLoggingOut ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Saliendo...</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          <span>Cerrar sesión</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-10 w-10 rounded-full bg-blue-primary flex items-center justify-center text-white">
                    <User className="h-5 w-5" />
                  </div>

                  <button
                    onClick={toggleDarkMode}
                    className="btn-ghost-safe p-2 rounded-md"
                    type="button"
                  >
                    {darkMode ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </button>

                  <button
                    onClick={() => setLogoutDialogOpen(true)}
                    disabled={isLoggingOut}
                    className="btn-safe p-2 rounded-md text-white bg-blue-primary hover:bg-blue-dark transition-colors disabled:opacity-70"
                    type="button"
                  >
                    {isLoggingOut ? (
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <LogOut className="h-5 w-5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex flex-col flex-1 min-w-0 ml-20 transition-all duration-300">
            {/* Header */}
            <header className="z-10 h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                {getSectionName()}
              </h1>
            </header>

            {/* Page content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900 p-0">
              {children}
            </main>
          </div>
        </div>
        <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
          <DialogContent>
            <DialogHeader className="items-center text-center">
              <div className="flex justify-center mb-3">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100">
                  <LogOut className="w-7 h-7 text-red-600" />
                </div>
              </div>

              <DialogTitle>
                ¿Estás seguro de que deseas cerrar sesión?
              </DialogTitle>

              <DialogDescription>
                Tendrás que volver a iniciar sesión para acceder al panel.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setLogoutDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  setLogoutDialogOpen(false);
                  handleLogout();
                }}
                className="w-full sm:w-auto"
              >
                Cerrar sesión
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AuthGuard>
    </DisplayNameContext.Provider>
  );
}

// Navigation link component
function NavLink({ href, title, icon, isActive, isCollapsed }) {
  return (
    <li>
      <Link
        href={href}
        className={`btn-safe flex items-center ${
          isCollapsed ? "justify-center" : "justify-start"
        } p-2 rounded-lg transition-colors ${
          isActive
            ? "bg-blue-primary text-white"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        <span
          className={`${
            isActive ? "text-white" : "text-blue-primary dark:text-gray-300"
          }`}
        >
          {icon}
        </span>
        {!isCollapsed && <span className="ml-3">{title}</span>}
      </Link>
    </li>
  );
}
