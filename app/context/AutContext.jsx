"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { usePathname, useRouter } from "next/navigation";
import auth_service from "../dashboard/users/services/auth.service";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Quita rol y permisos del objeto user antes de guardarlo en la cookie
const sinAutorizacion = (user) => {
  if (!user || typeof user !== "object") return user;
  const { rol, permisos, ...resto } = user;
  return resto;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const verifyToken = async () => {
      const token = getCookie("token");

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      try {
        const res = await auth_service.me();

        if (res && res.user) {
          const rolUsuario = res.rol || "cliente"; 
          const usuarioConRol = {
            ...res.user,
            rol: rolUsuario,
            permisos: res.permisos || [],
          };

          setIsAuthenticated(true);
          setUser(usuarioConRol);

          setCookie("user", JSON.stringify(sinAutorizacion(res.user)), {
            maxAge: 300 * 60,
            path: "/",
          });

        } else {
          setIsAuthenticated(false);
          setUser(null);
          auth_service.clearAuthCookies();
          router.replace("/login"); 
        }
      } catch (error) {
        console.error("Error al verificar el token:", error);
        setIsAuthenticated(false);
        setUser(null);
        deleteCookie("token");
      }
    };

    verifyToken();
  }, []);

  const login = async (formData) => {
    try {
      const result = await auth_service.login(formData);

      if (result.success === false) {
        return {
          success: false,
          status: result.status,
          message: result.message,
          // Importante: conserva remaining_attempts, retry_after, etc.
          data: result.data || {},
        };
      }

      const rolUsuario = result.rol || "cliente";
      const permisos = result.permisos || [];
      const usuarioConRol = {
        ...result.user,
        rol: rolUsuario,
        permisos,
      };

      // estado de react con rol y permisos
      setUser(usuarioConRol);

      setCookie("token", result.token, { maxAge: 300 * 60, path: "/" });
      // cookie user , sin rol ni permiso
      setCookie("user", JSON.stringify(sinAutorizacion(result.user)), {
        maxAge: 300 * 60,
        path: "/",
      });

      setIsAuthenticated(true);
      router.replace("/dashboard/main");

      return { success: true };
    } catch (error) {
      return {
        success: false,
        status: 500,
        message: "Error de conexión con el servidor. Intenta nuevamente.",
      };
    }
  };

  const logout = async () => {
    try {
      await auth_service.logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      auth_service.clearAuthCookies();
      setIsAuthenticated(false);
      setUser(null);
      setTimeout(() => router.replace("/login/"), 300);
    }
  };

  const normalize = (str) =>
    str
      ?.toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");

  // Solo usa el estado en memoria (sin leer cookies)
  const hasPermission = (permiso) => {
    const rol = user?.rol;
    if (rol === "administrador") return true;

    const permisos = user?.permisos;
    if (!Array.isArray(permisos)) return false;

    const normalizados = permisos.map((p) => normalize(p));
    return normalizados.includes(normalize(permiso));
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
};