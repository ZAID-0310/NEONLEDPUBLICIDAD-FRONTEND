"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { useRouter } from "next/navigation"; 
import auth_service from "../dashboard/users/services/auth.service";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);


const sinAutorizacion = (user) => {
  if (!user || typeof user !== "object") return user;
  const { rol, permisos, ...resto } = user;
  return resto;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
 

  useEffect(() => {

    let mounted = true;


    const verifyToken = async () => {
      const token = getCookie("token");

      if (!token) {
        if (mounted) {
    setIsAuthenticated(false);
    setUser(null);
    setIsLoading(false);
  }
  return;
      }

      try {
        const res = await auth_service.me();
        if (!mounted) return;


        if (res && res.user) {
          const rolUsuario = res.rol || "cliente";
          const usuarioConRol = {
            ...res.user,
            rol: rolUsuario,
            permisos: res.permisos || [],
          };

          setUser(usuarioConRol);
          setIsAuthenticated(true);

          setCookie("user", JSON.stringify(sinAutorizacion(res.user)), {
            maxAge: 300 * 60,
            path: "/",
          });
        } else {
          setIsAuthenticated(false);
          setUser(null);
          auth_service.clearAuthCookies();
        }
      } catch (error) {
        if (!mounted) return;
        console.error("Error al verificar el token:", error);
        setIsAuthenticated(false);
        setUser(null);
        deleteCookie("token");
        deleteCookie("user");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    verifyToken();
    return () => {
      mounted = false;
    };
  }, []);
  
  const login = async (formData) => {
    try {
      const result = await auth_service.login(formData);

      if (result.success === false) {
        return {
          success: false,
          status: result.status,
          message: result.message,
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

      setUser(usuarioConRol);
      setCookie("token", result.token, { maxAge: 300 * 60, path: "/" });
      setCookie("user", JSON.stringify(sinAutorizacion(result.user)), {
        maxAge: 300 * 60,
        path: "/",
      });

      setIsAuthenticated(true);
      setIsLoading(false);
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
      router.replace("/login");
    }
  };

  const normalize = (str) =>
    str
      ?.toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");

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
      value={{ isAuthenticated, isLoading, user, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
};